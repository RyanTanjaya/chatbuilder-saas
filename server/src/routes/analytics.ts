// Read-only analytics + conversation history for the dashboard. Everything here
// is owner-scoped: a user only ever sees stats and conversations for chatbots
// they own. Messages hang off conversations (no direct chatbotId), so per-bot
// message counts are rolled up from conversation counts in memory.
import { Router, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

export const analyticsRouter = Router();

// First user message doubles as a conversation's title/preview; this is what we
// fetch alongside each summary row.
const FIRST_USER_MESSAGE = {
  where: { role: 'user' },
  orderBy: { createdAt: 'asc' },
  take: 1,
} as const;

// GET /api/stats — workspace overview: totals, per-bot breakdown, recent threads.
analyticsRouter.get('/stats', requireAuth, async (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;

  const bots = await prisma.chatbot.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { documents: true, conversations: true } } },
  });
  const botIds = bots.map((b) => b.id);

  // Roll message counts up from conversations (Message has no chatbotId).
  const convoCounts = await prisma.conversation.findMany({
    where: { chatbotId: { in: botIds } },
    select: { chatbotId: true, _count: { select: { messages: true } } },
  });
  const msgByBot = new Map<string, number>();
  for (const c of convoCounts) {
    msgByBot.set(c.chatbotId, (msgByBot.get(c.chatbotId) ?? 0) + c._count.messages);
  }

  // Latest threads across all bots — skip empty conversation rows (an aborted
  // first turn can leave one behind with no messages).
  const recent = await prisma.conversation.findMany({
    where: { chatbotId: { in: botIds }, messages: { some: {} } },
    orderBy: { updatedAt: 'desc' },
    take: 6,
    include: {
      chatbot: { select: { id: true, name: true, accentColor: true } },
      messages: FIRST_USER_MESSAGE,
      _count: { select: { messages: true } },
    },
  });

  const totals = {
    chatbots: bots.length,
    documents: bots.reduce((s, b) => s + b._count.documents, 0),
    conversations: bots.reduce((s, b) => s + b._count.conversations, 0),
    messages: [...msgByBot.values()].reduce((s, n) => s + n, 0),
  };

  const perBot = bots.map((b) => ({
    id: b.id,
    name: b.name,
    accentColor: b.accentColor,
    conversations: b._count.conversations,
    messages: msgByBot.get(b.id) ?? 0,
    documents: b._count.documents,
  }));

  res.json({
    totals,
    perBot,
    recent: recent.map((c) => ({
      id: c.id,
      botId: c.chatbot.id,
      botName: c.chatbot.name,
      accentColor: c.chatbot.accentColor,
      preview: c.messages[0]?.content ?? 'New conversation',
      messageCount: c._count.messages,
      updatedAt: c.updatedAt,
    })),
  });
});

// GET /api/conversations[?bot=<id>] — owner's conversation threads, newest first.
analyticsRouter.get('/conversations', requireAuth, async (req: AuthedRequest, res: Response) => {
  const userId = req.user!.id;
  const botFilter = typeof req.query.bot === 'string' ? req.query.bot : undefined;

  const bots = await prisma.chatbot.findMany({ where: { userId }, select: { id: true } });
  let botIds = bots.map((b) => b.id);
  if (botFilter) {
    if (!botIds.includes(botFilter)) {
      return res.status(404).json({ error: 'Chatbot not found' });
    }
    botIds = [botFilter];
  }

  const convos = await prisma.conversation.findMany({
    where: { chatbotId: { in: botIds }, messages: { some: {} } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: {
      chatbot: { select: { id: true, name: true, accentColor: true } },
      messages: FIRST_USER_MESSAGE,
      _count: { select: { messages: true } },
    },
  });

  res.json({
    conversations: convos.map((c) => ({
      id: c.id,
      botId: c.chatbot.id,
      botName: c.chatbot.name,
      accentColor: c.chatbot.accentColor,
      visitorId: c.visitorId,
      preview: c.messages[0]?.content ?? 'New conversation',
      messageCount: c._count.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  });
});

// Wrap a value as a CSV field: stringify, double embedded quotes, and always
// quote so commas/newlines in message bodies can't break the column layout.
function csvField(value: unknown): string {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

// GET /api/conversations/export[?bot=<id>] — download owner's conversations as
// CSV, one row per message. Registered before /:id so "export" isn't read as an
// id. A UTF-8 BOM is prepended so Excel opens non-ASCII content correctly.
analyticsRouter.get(
  '/conversations/export',
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const userId = req.user!.id;
    const botFilter = typeof req.query.bot === 'string' ? req.query.bot : undefined;

    const bots = await prisma.chatbot.findMany({ where: { userId }, select: { id: true } });
    let botIds = bots.map((b) => b.id);
    if (botFilter) {
      if (!botIds.includes(botFilter)) {
        return res.status(404).json({ error: 'Chatbot not found' });
      }
      botIds = [botFilter];
    }

    const convos = await prisma.conversation.findMany({
      where: { chatbotId: { in: botIds }, messages: { some: {} } },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        chatbot: { select: { name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    const header = [
      'conversation_id',
      'chatbot',
      'visitor',
      'conversation_started',
      'message_role',
      'message_content',
      'message_at',
    ];
    const lines = [header.map(csvField).join(',')];
    for (const c of convos) {
      for (const m of c.messages) {
        lines.push(
          [
            c.id,
            c.chatbot.name,
            c.visitorId ?? 'dashboard-test',
            c.createdAt.toISOString(),
            m.role,
            m.content,
            m.createdAt.toISOString(),
          ]
            .map(csvField)
            .join(',')
        );
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `conversations-${botFilter ? `${botFilter}-` : ''}${stamp}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('﻿' + lines.join('\r\n'));
  }
);

// GET /api/conversations/:id — full transcript. Ownership is enforced through
// the chatbot relation, so a foreign or unknown id is indistinguishable (404).
analyticsRouter.get(
  '/conversations/:id',
  requireAuth,
  async (req: AuthedRequest, res: Response) => {
    const convo = await prisma.conversation.findFirst({
      where: { id: String(req.params.id), chatbot: { userId: req.user!.id } },
      include: {
        chatbot: { select: { id: true, name: true, accentColor: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    res.json({
      conversation: {
        id: convo.id,
        botId: convo.chatbot.id,
        botName: convo.chatbot.name,
        accentColor: convo.chatbot.accentColor,
        visitorId: convo.visitorId,
        createdAt: convo.createdAt,
        messages: convo.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources ?? undefined,
          createdAt: m.createdAt,
        })),
      },
    });
  }
);
