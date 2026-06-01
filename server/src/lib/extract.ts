// Text extraction for the three supported upload formats.
// Returns a single plain-text string per file; chunking happens in step 6.
// NOTE: pdf-parse's top-level index.js has a side-effect that tries to read a
// bundled test PDF at import time — importing the lib path directly skips it.
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export type FileType = 'pdf' | 'txt' | 'docx';

// Map MIME types reported by the browser/multer onto our internal kind.
// We accept the legacy and modern MIME forms for each format.
export function detectFileType(mime: string, filename: string): FileType | null {
  const lower = filename.toLowerCase();
  if (mime === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    lower.endsWith('.docx')
  )
    return 'docx';
  if (mime === 'text/plain' || lower.endsWith('.txt')) return 'txt';
  return null;
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.docx'] as const;

// Hard ceiling per upload — pdfs over this are almost always images / scanned
// docs we can't usefully embed without OCR. Adjust later if real users complain.
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface ExtractedDoc {
  text: string;
  charCount: number;
  wordCount: number;
}

export async function extractText(buffer: Buffer, fileType: FileType): Promise<ExtractedDoc> {
  let raw: string;
  switch (fileType) {
    case 'pdf': {
      const { text } = await pdfParse(buffer);
      raw = text;
      break;
    }
    case 'docx': {
      const { value } = await mammoth.extractRawText({ buffer });
      raw = value;
      break;
    }
    case 'txt': {
      raw = buffer.toString('utf8');
      break;
    }
  }
  // Normalise:
  // - strip NUL bytes (postgres TEXT rejects them; some PDFs ship them)
  // - strip other C0 control chars except tab/newline
  // - collapse \r\n -> \n, trailing spaces per line, 3+ newlines -> 2
  // Keeps chunking deterministic in step 6.
  const text = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  return { text, charCount: text.length, wordCount };
}
