-- Cosine HNSW index for fast vector search on chunks.embedding.
-- HNSW (vs IVFFlat) builds fine on an empty table and doesn't need to be
-- rebuilt as the table grows. Defaults (m=16, ef_construction=64) are
-- the pgvector recommendation for general-purpose RAG.
CREATE INDEX IF NOT EXISTS "chunks_embedding_cosine_idx"
  ON "chunks"
  USING hnsw ("embedding" vector_cosine_ops);
