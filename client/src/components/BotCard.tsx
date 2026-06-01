// One chatbot card in the dashboard grid. Avatar tinted to the bot's
// accent color, two chips (doc count + msg count), then primary "Open" and
// secondary "Settings" buttons. Mirrors .bot-card from the handoff CSS.
import { Link } from 'react-router-dom';
import { Bot, FileText, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Chatbot } from '@/types/chatbot';

interface BotCardProps {
  bot: Chatbot;
}

export function BotCard({ bot }: BotCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong flex flex-col">
      <span
        className="grid place-items-center w-12 h-12 rounded-full text-white mb-3.5 flex-none"
        style={{ background: bot.accentColor }}
      >
        <Bot size={24} />
      </span>
      <div className="text-base font-bold text-text-strong">{bot.name}</div>
      <div className="text-[13px] text-text-muted mt-1 leading-relaxed line-clamp-2 min-h-[38px]">
        {bot.description || <span className="italic text-text-muted/70">No description yet.</span>}
      </div>

      <div className="flex gap-2 my-3.5">
        <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-pill bg-slate-100 text-text text-xs font-semibold">
          <FileText size={13} />
          {bot.documentCount} {bot.documentCount === 1 ? 'doc' : 'docs'}
        </span>
        <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-pill bg-slate-100 text-text text-xs font-semibold">
          <MessageSquare size={13} />
          {bot.conversationCount}{' '}
          {bot.conversationCount === 1 ? 'convo' : 'convos'}
        </span>
      </div>

      <div className="flex gap-2 mt-auto">
        <Button asChild variant="primary" size="sm" className="flex-1">
          <Link to={`/chatbots/${bot.id}`}>Open</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/chatbots/${bot.id}/settings`}>
            <SettingsIcon size={14} /> Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
