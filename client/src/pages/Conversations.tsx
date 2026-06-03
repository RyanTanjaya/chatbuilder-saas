// Conversations (/conversations) — owner's chat history. Left: a list of threads
// (optionally filtered to one bot via ?bot=<id>); right: the full transcript of
// the selected thread. Both come from GET /api/conversations[/:id]. Read-only.
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bot, FileText, MessagesSquare, User } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useChatbots } from '@/stores/chatbots';
import { cn, formatDateTime, timeAgo } from '@/lib/utils';
import type { ConversationDetail, ConversationMessage, ConversationSummary } from '@/types/analytics';

function visitorLabel(visitorId: string | null): string {
  if (!visitorId) return 'Dashboard test';
  return `Visitor ${visitorId.slice(0, 6)}`;
}

function TranscriptMessage({ m, accentColor }: { m: ConversationMessage; accentColor: string }) {
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
        <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words bg-surface-muted text-text">
          {m.content}
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

export default function Conversations() {
  const { list: bots, loaded: botsLoaded, load: loadBots } = useChatbots();
  const [params, setParams] = useSearchParams();
  const botParam = params.get('bot') ?? '';

  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!botsLoaded) void loadBots();
  }, [botsLoaded, loadBots]);

  // (Re)load the thread list whenever the bot filter changes.
  useEffect(() => {
    let active = true;
    setListLoaded(false);
    const url = botParam ? `/conversations?bot=${encodeURIComponent(botParam)}` : '/conversations';
    api
      .get<{ conversations: ConversationSummary[] }>(url)
      .then(({ data }) => {
        if (!active) return;
        setItems(data.conversations);
        setSelectedId((cur) =>
          cur && data.conversations.some((c) => c.id === cur)
            ? cur
            : data.conversations[0]?.id ?? null
        );
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setListLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [botParam]);

  // Load the selected transcript.
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    api
      .get<{ conversation: ConversationDetail }>(`/conversations/${selectedId}`)
      .then(({ data }) => {
        if (active) setDetail(data.conversation);
      })
      .catch(() => {
        if (active) setDetail(null);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const filterSelect = useMemo(
    () =>
      bots.length > 1 ? (
        <select
          value={botParam}
          onChange={(e) => {
            const v = e.target.value;
            setParams(v ? { bot: v } : {}, { replace: true });
          }}
          aria-label="Filter by chatbot"
          className="h-9 px-3 rounded-input border border-border bg-surface text-[13px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="">All chatbots</option>
          {bots.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      ) : null,
    [bots, botParam, setParams]
  );

  if (listLoaded && items.length === 0) {
    return (
      <Shell title="Conversations" subtitle="Every chat your bots have had" actions={filterSelect}>
        <div className="bg-surface border-2 border-dashed border-border-strong rounded-card p-14 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
            <MessagesSquare size={24} className="text-primary-dark" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-text-strong">
            {botParam ? 'No conversations for this chatbot' : 'No conversations yet'}
          </h3>
          <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
            Conversations appear here once visitors start chatting. Embed a bot or open its public
            link to try it.
          </p>
          <Button asChild variant="primary" className="mt-5">
            <Link to="/embed">Get embed snippet</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Conversations" subtitle="Every chat your bots have had" actions={filterSelect}>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-5 items-start">
        {/* Thread list */}
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-[13px] font-semibold text-text-muted">
            {listLoaded ? `${items.length} ${items.length === 1 ? 'thread' : 'threads'}` : 'Loading…'}
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            {!listLoaded ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-bg border border-border animate-pulse" />
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((c) => {
                  const active = c.id === selectedId;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors',
                          active ? 'bg-primary-light/60' : 'hover:bg-bg'
                        )}
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
                          <p className="text-[13px] text-text-muted truncate">{c.preview}</p>
                          <div className="flex items-center gap-2 text-[11px] text-text-muted mt-1">
                            <span>{c.messageCount} messages</span>
                            <span aria-hidden>·</span>
                            <span className="truncate">{visitorLabel(c.visitorId)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-surface border border-border rounded-card overflow-hidden min-h-[640px] flex flex-col">
          {!selectedId ? (
            <div className="flex-1 grid place-items-center text-sm text-text-muted p-10">
              Select a conversation to read the transcript.
            </div>
          ) : detailLoading && !detail ? (
            <div className="flex-1 p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-bg border border-border animate-pulse" />
              ))}
            </div>
          ) : detail ? (
            <>
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-none">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="grid place-items-center w-9 h-9 rounded-full text-white flex-none"
                    style={{ background: detail.accentColor }}
                  >
                    <Bot size={18} />
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/chatbots/${detail.botId}`}
                      className="text-sm font-bold text-text-strong truncate hover:text-primary-dark transition-colors block"
                    >
                      {detail.botName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                      <User size={12} />
                      {visitorLabel(detail.visitorId)}
                    </div>
                  </div>
                </div>
                <span className="text-[12px] text-text-muted flex-none">
                  {formatDateTime(detail.createdAt)}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {detail.messages.map((m) => (
                  <TranscriptMessage key={m.id} m={m} accentColor={detail.accentColor} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-sm text-text-muted p-10">
              Couldn&apos;t load this conversation.
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
