// One-off smoke script. Picks the most recent chatbot for the e2e test user,
// counts chunks, dumps the embedding length of the first one, and runs a
// cosine-similarity query so we know pgvector + HNSW are wired correctly.
// Run with: tsx server/scripts/verify-rag.ts
import { prisma } from '../src/lib/prisma.js';
import { embedQuery } from '../src/services/embeddings.js';

async function main() {
  const bot = await prisma.chatbot.findFirst({
    where: { user: { email: 'e2e@chatbuilder.local' } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { documents: true } } },
  });
  if (!bot) {
    console.error('no chatbot found for e2e user');
    process.exit(1);
  }
  console.log(`bot: ${bot.name} (${bot.id})`);
  console.log(`documents: ${bot._count.documents}`);

  const chunkRows: Array<{ id: string; len: number; preview: string }> =
    await prisma.$queryRawUnsafe(
      `SELECT id, array_length(embedding::float4[], 1) AS len, substr(content, 1, 80) AS preview
       FROM "chunks"
       WHERE "chatbotId" = $1
       ORDER BY "chunkIndex"`,
      bot.id
    );
  console.log(`chunks: ${chunkRows.length}`);
  chunkRows.forEach((r) => {
    console.log(`  - dim=${r.len} | ${r.preview.replace(/\s+/g, ' ')}`);
  });

  if (chunkRows.length === 0) return;

  // Cosine similarity search via pgvector's <=> operator.
  const query = 'how does the chunking and embedding work?';
  const v = await embedQuery(query);
  const top: Array<{ id: string; distance: number; preview: string }> =
    await prisma.$queryRawUnsafe(
      `SELECT id, (embedding <=> $1::vector) AS distance, substr(content, 1, 120) AS preview
       FROM "chunks"
       WHERE "chatbotId" = $2
       ORDER BY embedding <=> $1::vector
       LIMIT 3`,
      `[${v.join(',')}]`,
      bot.id
    );
  console.log(`\nquery: "${query}"`);
  top.forEach((r, i) => {
    console.log(
      `  ${i + 1}. distance=${r.distance.toFixed(4)} | ${r.preview.replace(/\s+/g, ' ')}`
    );
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
