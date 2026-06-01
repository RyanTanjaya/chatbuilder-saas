// ChatBuilder API — Express entry point.
import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { authRouter } from './routes/auth.js';
import { chatbotsRouter } from './routes/chatbots.js';
import { documentsRouter } from './routes/documents.js';
import { chatRouter } from './routes/chat.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Static embed widget (placeholder until step 10)
app.use(express.static('public'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/chatbots', chatbotsRouter);
// documentsRouter handles both /api/chatbots/:id/documents (list, upload) and
// /api/documents/:id (delete). Mounted at /api so both paths resolve.
app.use('/api', documentsRouter);
// chatRouter serves POST /api/chatbots/:id/chat (public — backs the dashboard
// test window, public chat page, and embed widget alike).
app.use('/api', chatRouter);

app.listen(env.PORT, () => {
  console.log(`[chatbuilder] api listening on http://localhost:${env.PORT}`);
});
