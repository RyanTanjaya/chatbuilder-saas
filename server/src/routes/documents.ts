// Document endpoints — list, upload, delete. Upload uses multer memoryStorage
// so we never touch disk; the buffer goes straight to the extractor and then
// (in step 6) to the chunker + embedder. For step 5, the upload pipeline ends
// at saving the Document row with extracted-text metadata; chunk rows arrive
// once the embedding pipeline lands.
import { Router, type Response } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import {
  detectFileType,
  extractText,
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_EXTENSIONS,
} from '../lib/extract.js';
import { ingestDocument } from '../services/ingest.js';

export const documentsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (detectFileType(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type. Accepted: ${SUPPORTED_EXTENSIONS.join(', ')}`
        )
      );
    }
  },
});

// Helper — most document operations need the parent chatbot loaded and an
// ownership check anyway. This keeps the route handlers tight.
async function loadOwnedChatbot(chatbotId: string, userId: string) {
  const bot = await prisma.chatbot.findUnique({ where: { id: chatbotId } });
  if (!bot) return { error: 'not_found' as const };
  if (bot.userId !== userId) return { error: 'forbidden' as const };
  return { bot };
}

// GET /api/chatbots/:id/documents — owner-only list of uploaded docs
documentsRouter.get(
  '/chatbots/:id/documents',
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const found = await loadOwnedChatbot(String(req.params.id), req.user!.id);
    if (found.error === 'not_found') return res.status(404).json({ error: 'Chatbot not found' });
    if (found.error === 'forbidden') return res.status(403).json({ error: 'Not your chatbot' });

    const docs = await prisma.document.findMany({
      where: { chatbotId: found.bot.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        fileType: true,
        byteSize: true,
        chunkCount: true,
        createdAt: true,
      },
    });
    res.json({ documents: docs });
  }
);

// POST /api/chatbots/:id/documents — multipart upload + extraction
documentsRouter.post(
  '/chatbots/:id/documents',
  requireAuth,
  upload.single('file'),
  async (req: AuthedRequest, res: Response) => {
    const found = await loadOwnedChatbot(String(req.params.id), req.user!.id);
    if (found.error === 'not_found') return res.status(404).json({ error: 'Chatbot not found' });
    if (found.error === 'forbidden') return res.status(403).json({ error: 'Not your chatbot' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded (expected field "file")' });

    const fileType = detectFileType(file.mimetype, file.originalname);
    if (!fileType) {
      return res.status(400).json({
        error: `Unsupported file type. Accepted: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      });
    }

    let extracted;
    try {
      extracted = await extractText(file.buffer, fileType);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to read file contents.';
      return res.status(422).json({ error: `Could not parse this file: ${message}` });
    }

    if (extracted.wordCount < 5) {
      return res.status(422).json({
        error:
          'This file looks empty or unreadable. If it is a scanned PDF, run OCR first.',
      });
    }

    const doc = await prisma.document.create({
      data: {
        chatbotId: found.bot.id,
        filename: file.originalname,
        fileType,
        byteSize: file.size,
        chunkCount: 0, // updated by ingestDocument once chunks are persisted
      },
    });

    // Full ingestion pipeline: chunk → batch-embed → insert chunks. If this
    // fails (e.g. OpenAI is down) we roll back by deleting the Document so
    // the user can retry cleanly rather than ending up with an unsearchable
    // half-ingested file.
    let ingest;
    try {
      ingest = await ingestDocument({
        documentId: doc.id,
        chatbotId: found.bot.id,
        text: extracted.text,
      });
    } catch (err) {
      await prisma.document.delete({ where: { id: doc.id } }).catch(() => {});
      const message =
        err instanceof Error ? err.message : 'Embedding pipeline failed.';
      return res.status(502).json({ error: `Could not embed this file: ${message}` });
    }

    const fresh = await prisma.document.findUnique({
      where: { id: doc.id },
      select: {
        id: true,
        filename: true,
        fileType: true,
        byteSize: true,
        chunkCount: true,
        createdAt: true,
      },
    });
    res.status(201).json({
      document: fresh,
      extraction: {
        charCount: ingest.charCount,
        wordCount: ingest.wordCount,
        chunkCount: ingest.chunkCount,
        preview: extracted.text.slice(0, 280),
      },
    });
  }
);

// DELETE /api/documents/:id — owner-only; cascades through Chunk rows
documentsRouter.delete(
  '/documents/:id',
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const doc = await prisma.document.findUnique({
      where: { id: String(req.params.id) },
      include: { chatbot: { select: { userId: true } } },
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.chatbot.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not your document' });
    }
    await prisma.document.delete({ where: { id: doc.id } });
    res.json({ ok: true });
  }
);

// Multer errors bubble up as MulterError; map them to clean JSON responses.
// Mounted last so it only catches errors from this router.
documentsRouter.use(
  (
    err: Error & { code?: string },
    _req: AuthedRequest,
    res: Response,
    next: (e?: unknown) => void
  ) => {
    if (err && (err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File too large. Max upload size is ${
          MAX_FILE_SIZE_BYTES / 1024 / 1024
        } MB.`,
      });
    }
    if (err && err.message?.startsWith('Unsupported file type')) {
      return res.status(415).json({ error: err.message });
    }
    next(err);
  }
);
