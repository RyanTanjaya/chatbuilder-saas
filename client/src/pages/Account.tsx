// Account (/account) — profile summary + a workspace usage snapshot + sign-out.
// Profile fields come from the auth store (GET /api/auth/me); the usage tiles are
// rolled up from the chatbots already in the store, so no extra request is needed.
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, FileText, LogOut, Mail, MessageSquare, User } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/stores/auth';
import { useChatbots } from '@/stores/chatbots';

function initialsFor(name: string | null, email: string): string {
  return (name ?? email ?? 'U')
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');
}

export default function Account() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const { list, loaded, load } = useChatbots();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const usage = useMemo(
    () => ({
      chatbots: list.length,
      documents: list.reduce((s, b) => s + b.documentCount, 0),
      conversations: list.reduce((s, b) => s + b.conversationCount, 0),
    }),
    [list]
  );

  function handleSignOut() {
    logout();
    navigate('/login', { replace: true });
  }

  // RequireAuth normally guarantees a user, but guard anyway for type-safety.
  if (!user) return null;

  const initials = initialsFor(user.name, user.email);

  return (
    <Shell title="Account" subtitle="Your profile and workspace at a glance">
      <div className="space-y-5">
        {/* Profile — avatar + identity on the left, read-only fields filling the rest */}
        <div className="bg-surface border border-border rounded-card p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4 lg:w-72 lg:flex-none">
              <span
                className="grid place-items-center w-16 h-16 rounded-full text-xl font-bold text-white flex-none font-serif"
                style={{ background: 'linear-gradient(135deg,#3b3d80,#6c6ec2)' }}
              >
                {initials || 'U'}
              </span>
              <div className="min-w-0">
                <div className="text-lg font-bold text-text-strong truncate">
                  {user.name || 'Your account'}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-text-muted truncate">
                  <Mail size={14} className="flex-none" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:flex-1">
              <div className="rounded-input border border-border bg-bg px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  <User size={12} /> Name
                </div>
                <div className="text-sm text-text-strong mt-0.5 truncate">
                  {user.name || <span className="italic text-text-muted">Not set</span>}
                </div>
              </div>
              <div className="rounded-input border border-border bg-bg px-3.5 py-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  <Mail size={12} /> Email
                </div>
                <div className="text-sm text-text-strong mt-0.5 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage snapshot + Session — side by side on wide screens, equal height */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
          <div className="bg-surface border border-border rounded-card p-6">
            <div className="font-serif text-[17px] font-semibold text-text-strong">Workspace usage</div>
            <div className="text-[13px] text-text-muted mb-4">Totals across everything you own</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-card border border-border bg-bg p-4">
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary-light text-primary-dark mb-2.5">
                  <Bot size={18} />
                </div>
                <div className="font-serif text-[26px] font-semibold text-text-strong tabular-nums">
                  {usage.chatbots.toLocaleString()}
                </div>
                <div className="text-[13px] text-text-muted">Chatbots</div>
              </div>
              <div className="rounded-card border border-border bg-bg p-4">
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary-light text-primary-dark mb-2.5">
                  <FileText size={18} />
                </div>
                <div className="font-serif text-[26px] font-semibold text-text-strong tabular-nums">
                  {usage.documents.toLocaleString()}
                </div>
                <div className="text-[13px] text-text-muted">Documents</div>
              </div>
              <div className="rounded-card border border-border bg-bg p-4">
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-primary-light text-primary-dark mb-2.5">
                  <MessageSquare size={18} />
                </div>
                <div className="font-serif text-[26px] font-semibold text-text-strong tabular-nums">
                  {usage.conversations.toLocaleString()}
                </div>
                <div className="text-[13px] text-text-muted">Conversations</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-card p-6 flex flex-col">
            <div className="font-serif text-[17px] font-semibold text-text-strong">Session</div>
            <div className="text-[13px] text-text-muted mt-0.5">
              Sign out of ChatBuilder on this device.
            </div>
            <Button
              variant="danger"
              onClick={handleSignOut}
              className="mt-4 lg:mt-auto self-start"
            >
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
