// Screen 6 — Public Chat. Standalone, no-auth, full-viewport chat that the
// embed widget loads inside its iframe. Deliberately free of dashboard chrome:
// an accent header bar, the shared ChatPanel, and a small brand footer. Fetches
// the bot's public projection with a bare axios call (no auth interceptor) so
// it behaves identically for anonymous visitors and logged-in owners.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Bot } from 'lucide-react';
import { ChatPanel } from '@/components/ChatPanel';
import type { PublicChatbot } from '@/types/chatbot';

export default function PublicChat() {
  const { id = '' } = useParams();
  const [bot, setBot] = useState<PublicChatbot | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    axios
      .get<{ chatbot: PublicChatbot }>(`/api/chatbots/${id}`)
      .then(({ data }) => {
        if (!alive) return;
        setBot(data.chatbot);
        setStatus('ready');
        document.title = `${data.chatbot.name} · Chat`;
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="h-screen grid place-items-center bg-bg">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (status === 'error' || !bot) {
    return (
      <div className="h-screen grid place-items-center bg-bg px-6 text-center">
        <div>
          <div className="grid place-items-center w-12 h-12 rounded-full bg-slate-100 text-text-muted mx-auto mb-3">
            <Bot size={24} />
          </div>
          <h1 className="text-base font-bold text-text-strong">Chatbot unavailable</h1>
          <p className="text-sm text-text-muted mt-1">
            This chatbot doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-surface">
      <header
        className="flex items-center gap-3 px-4 py-3 text-white flex-none"
        style={{ background: bot.accentColor }}
      >
        <span className="grid place-items-center w-9 h-9 rounded-full bg-white/20 flex-none">
          <Bot size={20} />
        </span>
        <div className="min-w-0">
          <div className="font-bold leading-tight truncate">{bot.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-white/85">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Online
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <ChatPanel
          chatbotId={bot.id}
          accentColor={bot.accentColor}
          welcomeMessage={bot.welcomeMessage}
          botName={bot.name}
          placeholder="Type your message…"
        />
      </div>

      <div className="flex-none text-center text-[11px] text-text-muted py-1.5 border-t border-border bg-surface">
        Powered by <span className="font-semibold text-text">ChatBuilder</span>
      </div>
    </div>
  );
}
