// Thin OpenAI client wrapper. Real calls land in services/ingest.ts and services/rag.ts.
import OpenAI from 'openai';
import { env } from './env.js';

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export const EMBED_MODEL = 'text-embedding-3-small'; // 1536 dim
export const CHAT_MODEL = 'gpt-4o-mini';
