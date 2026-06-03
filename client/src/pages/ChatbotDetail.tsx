// Screen 4 — Chatbot Detail. Two-column layout: Knowledge Base (documents +
// upload) on the left, a live chat test window wired to the real RAG endpoint
// on the right. The bot is read from the chatbot store (loaded once); a hard
// refresh straight to this URL triggers a load() first.
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Code2, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { DocumentsPanel } from '@/components/DocumentsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { useChatbots } from '@/stores/chatbots';

export default function ChatbotDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { loaded, load, getById, remove } = useChatbots();
  const bot = getById(id);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  if (!loaded) {
    return (
      <Shell title="Loading…">
        <div className="h-[600px] rounded-card bg-surface border border-border animate-pulse" />
      </Shell>
    );
  }

  if (!bot) {
    return (
      <Shell title="Chatbot not found">
        <div className="bg-surface border border-border rounded-card p-12 text-center text-text-muted">
          We couldn&apos;t find that chatbot.{' '}
          <Link className="text-primary-dark font-semibold" to="/chatbots">
            Back to chatbots
          </Link>
        </div>
      </Shell>
    );
  }

  const onDelete = async () => {
    if (
      !window.confirm(
        `Delete "${bot.name}"? This permanently removes its documents and conversations.`
      )
    )
      return;
    await remove(bot.id);
    navigate('/chatbots');
  };

  const isLive = bot.documentCount > 0;

  const header = (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] text-text-muted mb-1">
        <Link to="/chatbots" className="hover:text-text transition-colors">
          Chatbots
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium truncate">{bot.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-[25px] font-semibold text-text-strong tracking-tight">{bot.name}</h1>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-pill bg-success-soft text-success text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Live
          </span>
        ) : (
          <span className="inline-flex items-center h-6 px-2.5 rounded-pill bg-surface-muted text-text-muted text-xs font-semibold">
            Draft
          </span>
        )}
      </div>
    </div>
  );

  const actions = (
    <>
      <Button asChild variant="outline" size="sm">
        <Link to={`/embed?bot=${bot.id}`}>
          <Code2 size={14} /> Embed
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link to={`/chatbots/${bot.id}/settings`}>
          <SettingsIcon size={14} /> Settings
        </Link>
      </Button>
      <Button variant="danger" size="sm" onClick={() => void onDelete()}>
        <Trash2 size={14} /> Delete
      </Button>
    </>
  );

  return (
    <Shell header={header} actions={actions}>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5">
        <DocumentsPanel chatbotId={bot.id} />

        <div className="bg-surface border border-border rounded-card flex flex-col h-[640px] overflow-hidden">
          <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <div className="font-serif text-[17px] font-semibold text-text-strong">Test your bot</div>
              <div className="text-[13px] text-text-muted">
                Ask real questions — answers cite their sources
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-pill bg-success-soft text-success text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
            </span>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              chatbotId={bot.id}
              accentColor={bot.accentColor}
              welcomeMessage={bot.welcomeMessage}
              botName={bot.name}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}
