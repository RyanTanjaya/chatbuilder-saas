// Chatbot CRUD. Every endpoint except GET /:id (which is used by the public
// embed widget) is gated by requireAuth + an ownership check. Cascade deletes
// of documents/chunks/conversations are handled at the schema level.
import { Router, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

export const chatbotsRouter = Router();

const ACCENT_PRESETS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'] as const;
const POSITIONS = ['bottom-right', 'bottom-left'] as const;

const createSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  description: z.string().trim().max(280).optional().nullable(),
  welcomeMessage: z
    .string()
    .trim()
    .max(280)
    .optional()
    .default('Hi! How can I help you?'),
  accentColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i, 'Accent color must be a hex code')
    .optional()
    .default('#6366f1'),
  position: z.enum(POSITIONS).optional().default('bottom-right'),
});

const updateSchema = createSchema.partial();

// Shape returned to the client. Documents/conversations come in as counts so
// the dashboard cards can render chips without a follow-up request.
function publicBot(b: {
  id: string;
  name: string;
  description: string | null;
  welcomeMessage: string;
  accentColor: string;
  position: string;
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
  _count?: { documents: number; conversations: number };
}) {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    welcomeMessage: b.welcomeMessage,
    accentColor: b.accentColor,
    position: b.position,
    allowedDomains: b.allowedDomains,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    documentCount: b._count?.documents ?? 0,
    conversationCount: b._count?.conversations ?? 0,
  };
}

// GET /api/chatbots — current user's chatbots, newest first
chatbotsRouter.get('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const bots = await prisma.chatbot.findMany({
    where: { userId: req.user!.id },
    include: { _count: { select: { documents: true, conversations: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ chatbots: bots.map(publicBot) });
});

// POST /api/chatbots — create one
chatbotsRouter.post('/', requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const bot = await prisma.chatbot.create({
    data: { ...parsed.data, userId: req.user!.id },
    include: { _count: { select: { documents: true, conversations: true } } },
  });
  return res.status(201).json({ chatbot: publicBot(bot) });
});

// GET /api/chatbots/:id — single chatbot.
// Auth-aware: owner sees everything; an unauthenticated request (used by the
// embed widget and public chat page) only gets the rendering-relevant fields.
chatbotsRouter.get('/:id', async (req: AuthedRequest, res: Response) => {
  const bot = await prisma.chatbot.findUnique({
    where: { id: String(req.params.id) },
    include: { _count: { select: { documents: true, conversations: true } } },
  });
  if (!bot) return res.status(404).json({ error: 'Chatbot not found' });

  // If a token was sent and it matches the owner, return the full payload.
  // Otherwise return the minimal public projection used by the widget.
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const jwt = await import('jsonwebtoken');
      const { env } = await import('../lib/env.js');
      const payload = jwt.default.verify(
        authHeader.slice('Bearer '.length).trim(),
        env.JWT_SECRET
      ) as { sub: string };
      if (payload.sub === bot.userId) {
        return res.json({ chatbot: publicBot(bot) });
      }
    } catch {
      /* fall through to public projection */
    }
  }

  return res.json({
    chatbot: {
      id: bot.id,
      name: bot.name,
      welcomeMessage: bot.welcomeMessage,
      accentColor: bot.accentColor,
      position: bot.position,
      allowedDomains: bot.allowedDomains,
    },
  });
});

// PUT /api/chatbots/:id — owner-only update
chatbotsRouter.put('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const existing = await prisma.chatbot.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ error: 'Chatbot not found' });
  if (existing.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Not your chatbot' });
  }
  const bot = await prisma.chatbot.update({
    where: { id: String(req.params.id) },
    data: parsed.data,
    include: { _count: { select: { documents: true, conversations: true } } },
  });
  res.json({ chatbot: publicBot(bot) });
});

// DELETE /api/chatbots/:id — owner-only; cascades through docs/chunks/conversations
chatbotsRouter.delete('/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
  const existing = await prisma.chatbot.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) return res.status(404).json({ error: 'Chatbot not found' });
  if (existing.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Not your chatbot' });
  }
  await prisma.chatbot.delete({ where: { id: String(req.params.id) } });
  res.json({ ok: true });
});

export { ACCENT_PRESETS, POSITIONS };
