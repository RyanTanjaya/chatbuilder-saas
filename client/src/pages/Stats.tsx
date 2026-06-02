// Stats (/stats) — workspace analytics pulled from GET /api/stats: headline
// totals, a per-bot breakdown table, and the most recent conversation threads.
// Read-only; clicking a recent thread jumps to the Conversations page.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, MessagesSquare, FileText, Bot, ArrowRight } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { StatTile } from '@/components/StatTile';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { StatsResponse } from '@/types/analytics';

export default function Stats() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<StatsResponse>('/stats')
      .then(({ data }) => {
        if (active) setData(data);
      })
      .catch(() => {
        /* leave data null — render the empty state */
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loaded) {
    return (
      <Shell title="Stats" subtitle="Usage across all your chatbots">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-card bg-surface border border-border animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[320px] rounded-card bg-surface border border-border animate-pulse" />
          ))}
        </div>
      </Shell>
    );
  }

  const totals = data?.totals;
  const perBot = data?.perBot ?? [];
  const recent = data?.recent ?? [];
  const maxMsgs = Math.max(1, ...perBot.map((b) => b.messages));

  if (!totals || totals.chatbots === 0) {
    return (
      <Shell title="Stats" subtitle="Usage across all your chatbots">
        <div className="bg-surface border-2 border-dashed border-border-strong rounded-card p-14 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
            <MessagesSquare size={24} className="text-primary-dark" />
          </div>
          <h3 className="text-lg font-bold text-text-strong">No usage data yet</h3>
          <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
            Create a chatbot and share it — conversations and message volume will show up here.
          </p>
          <Button asChild variant="primary" className="mt-5">
            <Link to="/chatbots">
              Go to My Chatbots <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Stats" subtitle="Usage across all your chatbots">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatTile
          icon={MessagesSquare}
          color="indigo"
          num={totals.conversations.toLocaleString()}
          label="Conversations"
        />
        <StatTile
          icon={MessageSquare}
          color="purple"
          num={totals.messages.toLocaleString()}
          label="Messages"
        />
        <StatTile icon={FileText} color="green" num={totals.documents} label="Documents" />
        <StatTile icon={Bot} color="amber" num={totals.chatbots} label="Chatbots" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Per-bot breakdown */}
        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-base font-bold text-text-strong">Per-chatbot breakdown</div>
          <div className="text-[13px] text-text-muted mb-4">Messages, conversations & documents</div>
          <div className="space-y-4">
            {perBot.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between text-[13px] mb-1.5">
                  <Link
                    to={`/chatbots/${b.id}`}
                    className="flex items-center gap-2 font-semibold text-text-strong truncate pr-3 hover:text-primary-dark transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-none"
                      style={{ background: b.accentColor }}
                    />
                    <span className="truncate">{b.name}</span>
                  </Link>
                  <span className="text-text-muted tabular-nums flex-none">
                    {b.messages.toLocaleString()} msg
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: b.messages === 0 ? 0 : `${Math.max(6, (b.messages / maxMsgs) * 100)}%`,
                      background: b.accentColor,
                    }}
                  />
                </div>
                <div className="flex gap-4 text-[12px] text-text-muted mt-1.5">
                  <span>{b.conversations.toLocaleString()} conversations</span>
                  <span>{b.documents} documents</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent conversations */}
        <div className="bg-surface border border-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-bold text-text-strong">Recent conversations</div>
              <div className="text-[13px] text-text-muted">Latest threads across all bots</div>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/conversations">
                View all <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
          {recent.length === 0 ? (
            <div className="text-sm text-text-muted py-10 text-center">
              No conversations yet — share a bot to start collecting them.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((c) => (
                <Link
                  key={c.id}
                  to={`/conversations?bot=${c.botId}`}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group"
                >
                  <span
                    className="grid place-items-center w-8 h-8 rounded-full text-white flex-none mt-0.5"
                    style={{ background: c.accentColor }}
                  >
                    <Bot size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-text-strong truncate">
                        {c.botName}
                      </span>
                      <span className="text-[11px] text-text-muted flex-none">
                        {timeAgo(c.updatedAt)}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-muted truncate group-hover:text-text transition-colors">
                      {c.preview}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
