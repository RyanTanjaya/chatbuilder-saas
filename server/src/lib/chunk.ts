// Word-based chunker. The spec calls for ~500-token chunks with 50-token
// overlap, but we use words as a cheap stand-in (1 word ≈ 1.3 tokens for
// english prose). This is plenty accurate for RAG retrieval and skips having
// to ship a tokenizer.
//
// Overlap matters: an answer that straddles a chunk boundary (e.g. "the
// refund window is" / "30 days") is still recoverable via the next chunk.

export interface ChunkOptions {
  size?: number;
  overlap?: number;
}

export function chunkText(
  text: string,
  { size = 500, overlap = 50 }: ChunkOptions = {}
): string[] {
  if (size <= 0) throw new Error('chunk size must be > 0');
  if (overlap < 0 || overlap >= size) {
    throw new Error('chunk overlap must be >= 0 and < size');
  }
  const trimmed = text.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);
  if (words.length <= size) return [trimmed];

  const step = size - overlap;
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += step) {
    const slice = words.slice(i, i + size);
    if (slice.length === 0) break;
    chunks.push(slice.join(' '));
    if (i + size >= words.length) break; // last chunk already covered the tail
  }
  return chunks;
}
