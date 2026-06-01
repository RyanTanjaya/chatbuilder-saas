// Reusable live-chat thread wired to POST /api/chatbots/:id/chat. Manages the
// message list, the conversation id (so the bot remembers the thread), an
// optimistic typing bubble, and source citations. Kept dependency-light and
// prop-driven so the public chat page (step 9) can reuse it verbatim.
import { useEffect, useRef, useState } from 'react';
import { Bot, Send, FileText } from 'lucide-react';
import { streamChat } from '@/lib/chatStream';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

interface ChatPanelProps {
  chatbotId: string;
  accentColor: string;
  welcomeMessage: string;
  botName: string;
  placeholder?: string;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Assistant is typing">
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 rounded-full bg-text-muted/60 animate-bounce" />
    </span>
  );
}

function Bubble({ m, accentColor }: { m: ChatMessage; accentColor: string }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm text-white leading-relaxed whitespace-pre-wrap break-words"
          style={{ background: accentColor }}
        >
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <span
        className="grid place-items-center w-8 h-8 rounded-full text-white flex-none mt-0.5"
        style={{ background: accentColor }}
        aria-hidden
      >
        <Bot size={17} />
      </span>
      <div className="min-w-0 max-w-[80%]">
        <div
          className={cn(
            'rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
            m.error ? 'bg-danger-soft text-danger' : 'bg-slate-100 text-text'
          )}
        >
          {m.pending ? <TypingDots /> : m.content}
        </div>
        {m.sources && m.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {m.sources.map((s) => (
              <span
                key={s.documentId}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-primary-light text-primary-dark text-[11px] font-semibold"
              >
                <FileText size={11} />
                {s.filename}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatPanel({
  chatbotId,
  accentColor,
  welcomeMessage,
  botName,
  placeholder = 'Ask your bot a question…',
}: ChatPanelProps) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: welcomeMessage },
  ]);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const convoRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Keep the thread pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = async () => {
    const text = val.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    const typingId = crypto.randomUUID();
    setMsgs((m) => [...m, userMsg, { id: typingId, role: 'assistant', content: '', pending: true }]);
    setVal('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setBusy(true);

    // Accumulated answer text — the stream delivers it token by token.
    let acc = '';
    const fail = (message: string) =>
      setMsgs((m) =>
        m.map((x) =>
          x.id === typingId
            ? { id: typingId, role: 'assistant', content: message, error: true }
            : x
        )
      );

    try {
      await streamChat(
        chatbotId,
        { message: text, conversationId: convoRef.current ?? undefined },
        {
          onMeta: ({ conversationId }) => {
            if (conversationId) convoRef.current = conversationId;
          },
          onDelta: (delta) => {
            acc += delta;
            setMsgs((m) =>
              m.map((x) =>
                x.id === typingId ? { ...x, content: acc, pending: false } : x
              )
            );
          },
          onDone: ({ sources }) => {
            setMsgs((m) =>
              m.map((x) =>
                x.id === typingId
                  ? {
                      ...x,
                      content: acc || "Sorry, I couldn't generate a response. Please try again.",
                      pending: false,
                      sources,
                    }
                  : x
              )
            );
          },
          onError: (message) => fail(message || 'Sorry, something went wrong. Please try again.'),
        }
      );
    } catch {
      fail('Sorry, something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };
  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
        {msgs.map((m) => (
          <Bubble key={m.id} m={m} accentColor={accentColor} />
        ))}
      </div>
      <div className="flex-none border-t border-border p-3 flex items-end gap-2 bg-surface">
        <textarea
          ref={taRef}
          rows={1}
          value={val}
          onChange={onInput}
          onKeyDown={onKey}
          placeholder={placeholder}
          aria-label={`Message ${botName}`}
          className="flex-1 resize-none max-h-[120px] rounded-input border border-border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={!val.trim() || busy}
          aria-label="Send message"
          className="grid place-items-center w-10 h-10 rounded-btn text-white flex-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          style={{ background: accentColor }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
