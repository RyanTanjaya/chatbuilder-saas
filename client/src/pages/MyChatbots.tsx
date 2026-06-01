// My Chatbots — the management grid: search, "+ New Chatbot", and a 3-up grid
// of bot cards with empty + no-results states. The Dashboard (/) is now purely
// data-driven (totals + charts); this is where you actually browse and create
// chatbots.
import { useEffect, useState, useMemo } from 'react';
import { Bot, Plus, Search } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BotCard } from '@/components/BotCard';
import { NewChatbotDialog } from '@/components/NewChatbotDialog';
import { useChatbots } from '@/stores/chatbots';

export default function MyChatbots() {
  const { list, loading, loaded, load } = useChatbots();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q)
    );
  }, [list, query]);

  const actions = (
    <>
      <div className="relative w-60">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </span>
        <Input
          placeholder="Search chatbots…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="primary" onClick={() => setCreating(true)}>
        <Plus size={16} /> New Chatbot
      </Button>
    </>
  );

  return (
    <>
      <Shell
        title="Your Chatbots"
        subtitle="Manage, train, and deploy your AI assistants"
        actions={actions}
      >
        {loading && !loaded ? (
          <div className="grid grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[230px] rounded-card bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : query && filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-card p-12 text-center text-text-muted">
            No chatbots match <b className="text-text-strong">"{query}"</b>.
          </div>
        ) : list.length === 0 ? (
          <div className="bg-surface border-2 border-dashed border-border-strong rounded-card p-14 text-center">
            <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
              <Bot size={26} className="text-primary-dark" />
            </div>
            <h3 className="text-lg font-bold text-text-strong">No chatbots yet</h3>
            <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
              Create your first chatbot, upload your documents, and embed it on any
              website in minutes.
            </p>
            <Button variant="primary" className="mt-5" onClick={() => setCreating(true)}>
              <Plus size={16} /> Create your first chatbot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((b) => (
              <BotCard key={b.id} bot={b} />
            ))}
            {!query ? (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="border-2 border-dashed border-border-strong rounded-card text-text-muted hover:border-primary hover:text-primary-dark hover:bg-primary/5 transition-colors min-h-[230px] flex flex-col items-center justify-center gap-2"
              >
                <span className="grid place-items-center w-[46px] h-[46px] rounded-full bg-slate-100 group-hover:bg-primary-light">
                  <Plus size={22} />
                </span>
                <span className="font-semibold mt-1">Create new chatbot</span>
                <span className="text-xs">Upload docs &amp; go live in minutes</span>
              </button>
            ) : null}
          </div>
        )}
      </Shell>

      <NewChatbotDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
