// Batched OpenAI embedding helper. Calls text-embedding-3-small in chunks of
// EMBED_BATCH_SIZE inputs per request — one-by-one would burn ~100ms per
// chunk on round-trip overhead alone. The API returns embeddings in the same
// order as the inputs, so we can splice them back into the original array.
import { openai, EMBED_MODEL } from '../lib/openai.js';

const EMBED_BATCH_SIZE = 20;

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const out: number[][] = new Array(texts.length);
  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const res = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: batch,
    });
    res.data.forEach((item, j) => {
      out[i + j] = item.embedding;
    });
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedTexts([text]);
  if (!v) throw new Error('embedding failed: empty response');
  return v;
}
