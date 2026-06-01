// Dashboard (/) — data-driven overview only. Totals across all chatbots plus
// simple per-bot charts. Browsing/creating chatbots lives on the My Chatbots
// page. Richer time-series analytics arrive with the Stats step; the bars here
// are derived from the chatbot list we already have in the store.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  FileText,
  MessageSquare,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { StatTile } from '@/components/StatTile';
import { useChatbots } from '@/stores/chatbots';
import type { Chatbot } from '@/types/chatbot';

interface BarDatum {
  id: string;
  name: string;
  value: number;
  color: string;
}

function BarChartCard({
  title,
  subtitle,
  data,
  emptyHint,
}: {
  title: string;
  subtitle: string;
  data: BarDatum[];
  emptyHint: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const hasValues = data.some((d) => d.value > 0);

  return (
    <div className="bg-surface border border-border rounded-card p-5">
      <div className="text-base font-bold text-text-strong">{title}</div>
      <div className="text-[13px] text-text-muted mb-4">{subtitle}</div>
      {data.length === 0 || !hasValues ? (
        <div className="text-sm text-text-muted py-10 text-center">{emptyHint}</div>
      ) : (
        <div className="space-y-3.5">
          {data.map((d) => (
            <div key={d.id}>
              <div className="flex justify-between items-baseline text-[13px] mb-1">
                <span className="font-medium text-text-strong truncate pr-3">{d.name}</span>
                <span className="text-text-muted tabular-nums flex-none">{d.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: d.value === 0 ? 0 : `${Math.max(6, (d.value / max) * 100)}%`,
                    background: d.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { list, loaded, load } = useChatbots();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const totalDocs = list.reduce((s, b) => s + b.documentCount, 0);
  const totalConvos = list.reduce((s, b) => s + b.conversationCount, 0);
  const liveBots = list.filter((b) => b.documentCount > 0).length;

  const topBy = (key: keyof Pick<Chatbot, 'conversationCount' | 'documentCount'>): BarDatum[] =>
    [...list]
      .sort((a, b) => b[key] - a[key])
      .slice(0, 6)
      .map((b) => ({ id: b.id, name: b.name, value: b[key], color: b.accentColor }));

  if (!loaded) {
    return (
      <Shell title="Dashboard" subtitle="Your workspace at a glance">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[120px] rounded-card bg-surface border border-border animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-card bg-surface border border-border animate-pulse" />
          ))}
        </div>
      </Shell>
    );
  }

  const actions = (
    <Button asChild variant="outline">
      <Link to="/chatbots">
        Manage chatbots <ArrowRight size={16} />
      </Link>
    </Button>
  );

  return (
    <Shell title="Dashboard" subtitle="Your workspace at a glance" actions={actions}>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatTile icon={Bot} color="indigo" num={list.length} label="Total Chatbots" />
        <StatTile icon={FileText} color="purple" num={totalDocs} label="Total Documents" />
        <StatTile
          icon={MessageSquare}
          color="green"
          num={totalConvos.toLocaleString()}
          label="Total Conversations"
        />
        <StatTile icon={Radio} color="amber" num={liveBots} label="Live Chatbots" />
      </div>

      {list.length === 0 ? (
        <div className="bg-surface border-2 border-dashed border-border-strong rounded-card p-14 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
            <Bot size={26} className="text-primary-dark" />
          </div>
          <h3 className="text-lg font-bold text-text-strong">Nothing to show yet</h3>
          <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
            Create your first chatbot to start seeing usage data here.
          </p>
          <Button asChild variant="primary" className="mt-5">
            <Link to="/chatbots">
              Go to My Chatbots <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BarChartCard
            title="Conversations by chatbot"
            subtitle="Top bots by total conversations"
            data={topBy('conversationCount')}
            emptyHint="No conversations yet — share a bot to start collecting them."
          />
          <BarChartCard
            title="Documents by chatbot"
            subtitle="Knowledge base size per bot"
            data={topBy('documentCount')}
            emptyHint="No documents uploaded yet."
          />
        </div>
      )}
    </Shell>
  );
}
