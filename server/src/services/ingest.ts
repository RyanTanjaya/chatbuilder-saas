// Document ingestion pipeline. Called from POST /api/chatbots/:id/documents
// after the Document row is created and the raw text extracted. Splits the
// text into chunks, embeds each chunk in batches, and writes Chunk rows.
//
// Why raw SQL for the insert: Prisma's Unsupported("vector(1536)") type
// can't be written through the generated client, so we hand the embedding
// off to Postgres as a literal string the `vector` type knows how to
// parse: `[0.123,0.456,...]`.
import { prisma } from '../lib/prisma.js';
import { chunkText } from '../lib/chunk.js';
import { embedTexts } from './embeddings.js';
import { randomBytes } from 'node:crypto';

// Mirrors @paralleldrive/cuid2 length — we generate ids client-side because
// $executeRaw doesn't run @default(cuid()) for us.
function cuidLike() {
  return 'c' + randomBytes(12).toString('hex');
}

export interface IngestResult {
  chunkCount: number;
  charCount: number;
  wordCount: number;
}

export async function ingestDocument(args: {
  documentId: string;
  chatbotId: string;
  text: string;
}): Promise<IngestResult> {
  const chunks = chunkText(args.text, { size: 500, overlap: 50 });
  if (chunks.length === 0) {
    return { chunkCount: 0, charCount: args.text.length, wordCount: 0 };
  }

  const embeddings = await embedTexts(chunks);

  // Bulk insert: one INSERT with as many VALUES rows as we have chunks.
  // Parameter list is built positionally so embeddings round-trip safely
  // even if a chunk contains awkward characters. chunkIndex is an explicit
  // parameter — we don't rely on row_number() because VALUES ordering is
  // implementation-defined.
  const ids = chunks.map(() => cuidLike());
  const rows: string[] = [];
  const params: unknown[] = [];
  chunks.forEach((content, i) => {
    const base = i * 6;
    rows.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
        base + 5
      }::vector, $${base + 6}::int, NOW())`
    );
    params.push(
      ids[i],
      args.documentId,
      args.chatbotId,
      content,
      `[${embeddings[i]!.join(',')}]`,
      i
    );
  });
  const sql = `
    INSERT INTO "chunks" ("id", "documentId", "chatbotId", "content", "embedding", "chunkIndex", "createdAt")
    VALUES ${rows.join(', ')}
  `;
  await prisma.$executeRawUnsafe(sql, ...params);

  await prisma.document.update({
    where: { id: args.documentId },
    data: { chunkCount: chunks.length },
  });

  const wordCount = args.text.split(/\s+/).filter(Boolean).length;
  return { chunkCount: chunks.length, charCount: args.text.length, wordCount };
}
