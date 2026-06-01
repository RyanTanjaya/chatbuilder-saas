// "+ New Chatbot" modal. Three fields (name required, description optional,
// welcome message with sensible default) plus a 5-swatch accent picker.
// On success it pushes to the new bot's detail page so the user can upload
// docs immediately.
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatbotDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const create = useChatbots((s) => s.create);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you?');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [serverFields, setServerFields] = useState<FieldErrors>({});

  function reset() {
    setName('');
    setDescription('');
    setWelcomeMessage('Hi! How can I help you?');
    setAccentColor('#6366f1');
    setSubmitting(false);
    setTouched(false);
    setServerFields({});
  }

  const clientNameErr = touched && name.trim().length < 2 ? 'Name must be at least 2 characters' : undefined;
  const nameErr = clientNameErr ?? firstFieldError(serverFields, 'name');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setServerFields({});
    if (name.trim().length < 2) return;
    setSubmitting(true);
    try {
      const bot = await create({
        name: name.trim(),
        description: description.trim() || undefined,
        welcomeMessage: welcomeMessage.trim() || undefined,
        accentColor,
      });
      reset();
      onOpenChange(false);
      navigate(`/chatbots/${bot.id}`);
    } catch (err) {
      const { fields } = normaliseError(err);
      setServerFields(fields);
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new chatbot</DialogTitle>
          <DialogDescription>
            Set up the basics — you can upload documents on the next screen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate>
          <Field label="Name" htmlFor="bot-name" error={nameErr}>
            <Input
              id="bot-name"
              placeholder="e.g. Support Bot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              hasError={!!nameErr}
              autoFocus
            />
          </Field>

          <Field
            label="Description"
            htmlFor="bot-desc"
            hint="Optional — shown on your dashboard."
          >
            <Input
              id="bot-desc"
              placeholder="Answers customer support questions from our help center."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <Field
            label="Welcome message"
            htmlFor="bot-welcome"
            hint="First message visitors see when they open the chat."
          >
            <Input
              id="bot-welcome"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
            />
          </Field>

          <Field label="Accent color">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create chatbot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
