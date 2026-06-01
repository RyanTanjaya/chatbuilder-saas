// Placeholder dashboard — fully built in Step 4. This exists right now so the
// auth flow has a real protected destination to land on after login.
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/stores/auth';

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <Brand />
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
      <div className="rounded-card border border-border bg-surface shadow-sm p-7">
        <h1 className="text-xl font-extrabold text-text-strong mb-2">
          Welcome{user?.name ? `, ${user.name}` : ''} 👋
        </h1>
        <p className="text-sm text-text-muted">
          You're authenticated. The real dashboard (chatbot grid, stats, new-bot CTA)
          lands in Step 4 — Chatbot CRUD.
        </p>
        <div className="mt-5 grid gap-2 text-xs text-text-muted">
          <div>
            <span className="font-semibold text-text-strong">User id:</span> {user?.id}
          </div>
          <div>
            <span className="font-semibold text-text-strong">Email:</span> {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
}
