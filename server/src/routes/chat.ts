// Chat endpoint — the core RAG feature. Intentionally public (no requireAuth)
// because the same endpoint backs the dashboard test window, the public chat
// page, and the embed widget on third-party sites. A visitor continues a
// thread by passing back the conversationId we return; we always re-validate
// that the conversation belongs to this chatbot before trusting it.
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { streamAnswer, type ChatTurn, type RagStream } from '../services/rag.js';
import { fireConversationWebhook } from '../services/webhook.js';

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
  // Track whether this request opened a fresh thread — used to fire the
  // "new conversation" webhook exactly once, after the first turn persists.
  const isNewConversation = !conversation;
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

  // Kick off generation. This resolves once the model connection is open, so a
  // bad API key, an embedding failure, etc. still surface as a clean JSON 502
  // — we only switch to SSE once we know tokens are actually coming.
  let stream: RagStream;
  try {
    stream = await streamAnswer({
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

  // From here on the response is a Server-Sent Events stream: a `meta` frame
  // with the conversation id, a run of `delta` frames carrying answer tokens,
  // then a terminal `done` (with sources) or `error` frame.
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no', // ask nginx-style proxies not to buffer the stream
  });

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // If the visitor closes the tab mid-answer, abort the OpenAI request so we
  // stop paying for tokens nobody will read — and skip persisting a half-turn.
  let aborted = false;
  req.on('close', () => {
    if (!res.writableEnded) {
      aborted = true;
      stream.abort();
    }
  });

  send('meta', { conversationId: conversation.id });

  let answer = '';
  try {
    for await (const delta of stream.textStream) {
      if (aborted) break;
      answer += delta;
      send('delta', { text: delta });
    }
  } catch {
    if (!aborted) {
      send('error', { message: 'The assistant stopped responding. Please try again.' });
    }
    return res.end();
  }

  if (aborted) return res.end();

  if (!answer.trim()) {
    answer = "Sorry, I couldn't generate a response. Please try again.";
  }

  // Persist the turn (user + assistant) atomically and bump the conversation so
  // it sorts to the top of any "recent conversations" list. We only write once
  // the answer is complete, so an aborted or failed stream leaves no orphan rows.
  const [, assistant] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: answer,
        sources: stream.sources as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  send('done', { sources: stream.sources, createdAt: assistant.createdAt });
  res.end();

  // Notify the bot owner's endpoint that a new thread has begun. Fire-and-forget
  // and post-response, so it can never slow down or break the visitor's chat.
  if (isNewConversation && bot.webhookUrl) {
    void fireConversationWebhook(bot.webhookUrl, {
      event: 'conversation.created',
      chatbotId: bot.id,
      chatbotName: bot.name,
      conversationId: conversation.id,
      visitorId: conversation.visitorId,
      message: { role: 'user', content: message },
      createdAt: conversation.createdAt.toISOString(),
    });
  }
});
