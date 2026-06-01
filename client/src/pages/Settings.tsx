// Screen 8 — Chatbot Settings. Lets the owner edit the bot's name, description,
// welcome message, accent color, and launcher position. Accent + position +
// welcome message all flow straight through to the public chat page and the
// embed widget (which read them from GET /api/chatbots/:id), so the right-hand
// preview mirrors what a visitor actually sees. The bot is pulled from the
// chatbot store; a hard refresh straight to this URL triggers a load() first.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, ChevronRight, Send } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/Field';
import { useChatbots } from '@/stores/chatbots';
import { firstFieldError, normaliseError, type FieldErrors } from '@/lib/errors';
import { cn } from '@/lib/utils';

const ACCENTS = [
  { value: '#6366f1', name: 'Indigo' },
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#ef4444', name: 'Rose' },
];

type Position = 'bottom-right' | 'bottom-left';

export default function Settings() {
  const { id = '' } = useParams();
  const { loaded, load, getById, update } = useChatbots();
  const bot = getById(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [position, setPosition] = useState<Position>('bottom-right');

  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverFields, setServerFields] = useState<FieldErrors>({});
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  // Seed the form once the bot is available (and re-seed if the id changes).
  useEffect(() => {
    if (!bot) return;
    setName(bot.name);
    setDescription(bot.description ?? '');
    setWelcomeMessage(bot.welcomeMessage);
    setAccentColor(bot.accentColor);
    setPosition(bot.position);
  }, [bot?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => savedTimer.current && clearTimeout(savedTimer.current), []);

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

  const clientNameErr =
    touched && name.trim().length < 2 ? 'Name must be at least 2 characters' : undefined;
  const nameErr = clientNameErr ?? firstFieldError(serverFields, 'name');

  const dirty =
    name.trim() !== bot.name ||
    (description.trim() || '') !== (bot.description ?? '') ||
    welcomeMessage.trim() !== bot.welcomeMessage ||
    accentColor !== bot.accentColor ||
    position !== bot.position;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setServerFields({});
    setSaved(false);
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      await update(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        welcomeMessage: welcomeMessage.trim() || undefined,
        accentColor,
        position,
      });
      setSaved(true);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const { fields } = normaliseError(err);
      setServerFields(fields);
    } finally {
      setSaving(false);
    }
  }

  const header = (
    <div>
      <div className="flex items-center gap-1.5 text-[13px] text-text-muted mb-1">
        <Link to="/chatbots" className="hover:text-text transition-colors">
          Chatbots
        </Link>
        <ChevronRight size={14} />
        <Link to={`/chatbots/${bot.id}`} className="hover:text-text transition-colors truncate">
          {bot.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Settings</span>
      </div>
      <h1 className="text-[22px] font-extrabold text-text-strong tracking-tight">Settings</h1>
    </div>
  );

  const actions = (
    <Button asChild variant="outline" size="sm">
      <Link to={`/chatbots/${bot.id}`}>
        <ArrowLeft size={14} /> Back to bot
      </Link>
    </Button>
  );

  return (
    <Shell header={header} actions={actions}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5 items-start">
        {/* Form */}
        <form
          onSubmit={submit}
          noValidate
          className="bg-surface border border-border rounded-card p-6"
        >
          <Field label="Name" htmlFor="set-name" error={nameErr}>
            <Input
              id="set-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              hasError={!!nameErr}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="set-desc"
            hint="Optional — shown on your dashboard, never to visitors."
          >
            <Input
              id="set-desc"
              placeholder="Answers support questions from our help center."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field
            label="Welcome message"
            htmlFor="set-welcome"
            hint="The first message visitors see when they open the chat."
          >
            <Input
              id="set-welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </Field>

          <Field label="Accent color" hint="Used for the launcher button, header, and your messages.">
            <div className="flex gap-2 mt-0.5">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAccentColor(a.value)}
                  aria-label={a.name}
                  aria-pressed={accentColor === a.value}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    accentColor === a.value
                      ? 'border-text-strong scale-110'
                      : 'border-border hover:scale-105'
                  )}
                  style={{ background: a.value }}
                />
              ))}
            </div>
          </Field>

          <Field label="Launcher position" hint="Which corner the chat bubble sits in on your site.">
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              {(
                [
                  { value: 'bottom-right', label: 'Bottom right' },
                  { value: 'bottom-left', label: 'Bottom left' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPosition(opt.value)}
                  aria-pressed={position === opt.value}
                  className={cn(
                    'h-10 rounded-input border text-sm font-semibold transition-colors',
                    position === opt.value
                      ? 'border-primary bg-primary-light text-primary-dark'
                      : 'border-border text-text-muted hover:border-border-strong'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
            <Button type="submit" variant="primary" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            {saved ? (
              <span className="text-sm font-semibold text-success">Saved</span>
            ) : dirty ? (
              <span className="text-sm text-text-muted">Unsaved changes</span>
            ) : null}
          </div>
        </form>

        {/* Live preview — mirrors the public chat window the widget opens */}
        <div className="bg-surface border border-border rounded-card p-5">
          <div className="text-base font-bold text-text-strong mb-3">Preview</div>
          <div className="relative rounded-xl bg-bg border border-border overflow-hidden h-[420px]">
            {/* Mini chat window */}
            <div className="absolute inset-3 bottom-20 rounded-lg bg-surface border border-border shadow-card flex flex-col overflow-hidden">
              <div
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-white flex-none"
                style={{ background: accentColor }}
              >
                <span className="grid place-items-center w-7 h-7 rounded-full bg-white/20 flex-none">
                  <Bot size={15} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-tight truncate">
                    {name.trim() || 'Your bot'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Online
                  </div>
                </div>
              </div>
              <div className="flex-1 p-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-[13px] leading-relaxed text-text">
                  {welcomeMessage.trim() || 'Hi! How can I help you?'}
                </div>
              </div>
              <div className="flex-none border-t border-border p-2 flex items-center gap-2">
                <div className="flex-1 h-8 rounded-input border border-border bg-surface" />
                <span
                  className="grid place-items-center w-8 h-8 rounded-btn text-white flex-none"
                  style={{ background: accentColor }}
                >
                  <Send size={14} />
                </span>
              </div>
            </div>
            {/* Launcher bubble, parked in the chosen corner */}
            <span
              className={cn(
                'absolute bottom-4 grid place-items-center w-12 h-12 rounded-full text-white shadow-card',
                position === 'bottom-left' ? 'left-4' : 'right-4'
              )}
              style={{ background: accentColor }}
              aria-hidden
            >
              <Bot size={22} />
            </span>
          </div>
          <p className="text-[12px] text-text-muted mt-3">
            Changes apply to the public chat page and the embed widget as soon as you save.
          </p>
        </div>
      </div>
    </Shell>
  );
}
