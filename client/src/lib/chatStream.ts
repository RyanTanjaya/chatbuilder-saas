// Streaming client for POST /api/chatbots/:id/chat. The endpoint replies with
// Server-Sent Events (a `meta` frame, a run of `delta` frames, then `done` or
// `error`), which axios can't surface incrementally — so we use fetch + a
// ReadableStream reader and parse the SSE frames by hand. The endpoint is
// public, but we still forward the owner's JWT when present so the dashboard
// test window shares the same auth context as the rest of the app.
import { API_BASE_URL, TOKEN_KEY } from './api';
import type { ChatSource } from '@/types/chat';

export interface StreamHandlers {
  onMeta?: (data: { conversationId: string }) => void;
  onDelta: (text: string) => void;
  onDone: (data: { sources?: ChatSource[]; createdAt?: string }) => void;
  onError: (message: string) => void;
}

interface ChatRequest {
  message: string;
  conversationId?: string;
  visitorId?: string;
}

export async function streamChat(
  chatbotId: string,
  body: ChatRequest,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE_URL}/chatbots/${encodeURIComponent(chatbotId)}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(body),
    signal,
  });

  // Errors raised before the stream begins (validation, 404, 502) come back as
  // a normal JSON body, not SSE — surface their message verbatim.
  if (!res.ok || !res.body) {
    let message = 'Sorry, something went wrong. Please try again.';
    try {
      const data = (await res.json()) as { error?: unknown };
      if (typeof data.error === 'string') message = data.error;
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    handlers.onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (frame: string) => {
    let event = 'message';
    const dataLines: string[] = [];
    for (const raw of frame.split('\n')) {
      const line = raw.replace(/\r$/, '');
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    if (dataLines.length === 0) return;

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(dataLines.join('\n')) as Record<string, unknown>;
    } catch {
      return;
    }

    if (event === 'meta') handlers.onMeta?.(payload as { conversationId: string });
    else if (event === 'delta') handlers.onDelta((payload.text as string) ?? '');
    else if (event === 'done') handlers.onDone(payload as { sources?: ChatSource[]; createdAt?: string });
    else if (event === 'error') handlers.onError((payload.message as string) ?? 'Something went wrong.');
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (frame.trim()) dispatch(frame);
    }
  }
}
