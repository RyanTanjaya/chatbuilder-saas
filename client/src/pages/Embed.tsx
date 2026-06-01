// Embed page — generates the one-line <script> snippet that drops the chatbot
// onto any website, with a copy button and a live preview of the widget the
// snippet produces. The widget JS is served by the API; the chat iframe it
// opens is served by this app, so the snippet carries both origins.
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bot, Check, Code2, Copy } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { useChatbots } from '@/stores/chatbots';

// Where the widget script + config API live. In dev that's the Express server;
// in prod it's set via VITE_WIDGET_API_URL at build time.
const API_ORIGIN =
  (import.meta.env.VITE_WIDGET_API_URL as string | undefined) || 'http://localhost:4000';

function buildSnippet(botId: string, appOrigin: string): string {
  return [
    '<script',
    `  src="${API_ORIGIN}/widget.js"`,
    `  data-chatbot-id="${botId}"`,
    `  data-host="${appOrigin}"`,
    '  async></script>',
  ].join('\n');
}

export default function Embed() {
  const { list, loaded, load } = useChatbots();
  const [params, setParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const appOrigin = window.location.origin;
  const requested = params.get('bot');
  const selected = useMemo(
    () => list.find((b) => b.id === requested) ?? list[0],
    [list, requested]
  );

  const snippet = selected ? buildSnippet(selected.id, appOrigin) : '';

  const onCopy = async () => {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — user can still select the text manually */
    }
  };

  if (!loaded) {
    return (
      <Shell title="Embed" subtitle="Add your chatbot to any website">
        <div className="h-[420px] rounded-card bg-surface border border-border animate-pulse" />
      </Shell>
    );
  }

  if (list.length === 0) {
    return (
      <Shell title="Embed" subtitle="Add your chatbot to any website">
        <div className="bg-surface border-2 border-dashed border-border-strong rounded-card p-14 text-center">
          <div className="grid place-items-center w-14 h-14 rounded-full bg-primary-light mx-auto mb-4">
            <Code2 size={24} className="text-primary-dark" />
          </div>
          <h3 className="text-lg font-bold text-text-strong">No chatbots to embed yet</h3>
          <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
            Create a chatbot first, then come back here for its embed snippet.
          </p>
          <Button asChild variant="primary" className="mt-5">
            <Link to="/chatbots">Go to My Chatbots</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Embed" subtitle="Add your chatbot to any website">
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        {/* Left: chooser + snippet + steps */}
        <div className="space-y-5">
          {list.length > 1 ? (
            <div className="bg-surface border border-border rounded-card p-5">
              <label
                htmlFor="embed-bot"
                className="block text-[13px] font-semibold text-text-strong mb-1.5"
              >
                Chatbot
              </label>
              <select
                id="embed-bot"
                value={selected?.id ?? ''}
                onChange={(e) => setParams({ bot: e.target.value }, { replace: true })}
                className="w-full h-10 px-3 rounded-input border border-border bg-surface text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {list.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="bg-surface border border-border rounded-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <div className="text-base font-bold text-text-strong">Embed snippet</div>
                <div className="text-[13px] text-text-muted">
                  Paste this just before the closing <code>&lt;/body&gt;</code> tag.
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => void onCopy()}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="px-5 py-4 text-[13px] leading-relaxed text-slate-100 bg-navy overflow-x-auto">
              <code>{snippet}</code>
            </pre>
          </div>

          <div className="bg-surface border border-border rounded-card p-5">
            <div className="text-base font-bold text-text-strong mb-3">How it works</div>
            <ol className="space-y-2.5 text-sm text-text-muted">
              {[
                'Copy the snippet above and paste it into your site’s HTML.',
                'A chat bubble appears in the corner, styled to your bot’s accent color and position.',
                'Visitors click it to chat — answers are grounded in the documents you uploaded.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid place-items-center flex-none w-5 h-5 rounded-full bg-primary-light text-primary-dark text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: live preview of the chat the widget opens */}
        {selected ? (
          <div className="bg-surface border border-border rounded-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="text-base font-bold text-text-strong">Live preview</div>
              <span className="inline-flex items-center gap-1.5 text-[12px] text-text-muted">
                <span
                  className="w-3 h-3 rounded-full border border-black/10"
                  style={{ background: selected.accentColor }}
                />
                {selected.position}
              </span>
            </div>
            <div className="relative flex-1 min-h-[520px] rounded-xl bg-bg border border-border overflow-hidden">
              <iframe
                key={selected.id}
                title="Chat preview"
                src={`${appOrigin}/chat/${selected.id}`}
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            <p className="text-[12px] text-text-muted mt-3">
              This is the chat window visitors see when they open the bubble.
            </p>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
