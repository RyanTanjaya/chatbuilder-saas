// ChatBuilder API — Express entry point.
import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { authRouter } from './routes/auth.js';
import { chatbotsRouter } from './routes/chatbots.js';
import { documentsRouter } from './routes/documents.js';
import { chatRouter } from './routes/chat.js';
import { analyticsRouter } from './routes/analytics.js';

const app = express();

// CORS is split: the dashboard/owner endpoints stay locked to the app origin,
// but the public chatbot config GET (read by the embed widget on arbitrary
// third-party sites) is opened to any origin. It only ever returns the minimal
// public projection to unauthenticated callers, so this is safe.
const appCors = cors({ origin: env.CLIENT_ORIGIN, credentials: true });
const openCors = cors({ origin: '*' });
const PUBLIC_CONFIG_PATH = /^\/api\/chatbots\/[^/]+$/;

app.use((req, res, next) => {
  if (req.method === 'GET' && PUBLIC_CONFIG_PATH.test(req.path)) {
    return openCors(req, res, next);
  }
  return appCors(req, res, next);
});
app.use(express.json({ limit: '2mb' }));

// Serves the embed widget at /widget.js (server/public/widget.js).
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
// analyticsRouter serves owner-only GET /api/stats and /api/conversations[/:id].
app.use('/api', analyticsRouter);

app.listen(env.PORT, () => {
  console.log(`[chatbuilder] api listening on http://localhost:${env.PORT}`);
});
