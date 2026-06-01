// Chat endpoint — the core RAG feature. Intentionally public (no requireAuth)
// because the same endpoint backs the dashboard test window, the public chat
// page, and the embed widget on third-party sites. A visitor continues a
// thread by passing back the conversationId we return; we always re-validate
// that the conversation belongs to this chatbot before trusting it.
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { answerQuestion, type ChatTurn } from '../services/rag.js';

export const chatRouter = Router();

// How many prior messages to thread into the model so the bot "remembers" the
// conversation. 10 messages ≈ 5 turns — enough for follow-ups without blowing
// up the prompt (or the token bill).
const HISTORY_LIMIT = 10;

const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
  conversationId: z.string().optional(),
  visitorId: z.string().max(128).optional(),
});

// POST /api/chatbots/:id/chat
chatRouter.post('/chatbots/:id/chat', async (req: Request, res: Response) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { message, conversationId, visitorId } = parsed.data;

  const bot = await prisma.chatbot.findUnique({ where: { id: String(req.params.id) } });
  if (!bot) return res.status(404).json({ error: 'Chatbot not found' });

  // Resolve the conversation: reuse the caller's if it genuinely belongs to
  // this bot, otherwise start a fresh one. Never trust a conversationId blindly
  // — a mismatch would let one visitor read another bot's history.
  let conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: { id: conversationId, chatbotId: bot.id },
      })
    : null;
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { chatbotId: bot.id, visitorId: visitorId ?? null },
    });
  }

  // Recent history, oldest-first, excluding the message we're about to add.
  const recent = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
  });
  const history: ChatTurn[] = recent
    .reverse()
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  let result;
  try {
    result = await answerQuestion({
      bot: { id: bot.id, name: bot.name },
      question: message,
      history,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'chat generation failed';
    return res
      .status(502)
      .json({ error: `The assistant is unavailable right now: ${detail}` });
  }

  // Persist the turn (user + assistant) atomically and bump the conversation so
  // it sorts to the top of any "recent conversations" list. We only write once
  // generation succeeds, so a transient OpenAI failure leaves no orphan rows.
  const [, assistant] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: result.answer,
        sources: result.sources as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  res.json({
    conversationId: conversation.id,
    message: {
      role: 'assistant',
      content: assistant.content,
      sources: result.sources,
      createdAt: assistant.createdAt,
    },
  });
});
