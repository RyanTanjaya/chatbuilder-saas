// Shared shell for the login + register cards. Indigo/purple radial gradient
// background, centered 410px white card. Mirrors .auth-wrap/.auth-card.
import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen grid place-items-center px-5 py-8 bg-bg overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% -8%, rgba(99,102,241,.10), transparent 70%), radial-gradient(40% 40% at 90% 100%, rgba(139,92,246,.08), transparent 70%)',
        }}
      />
      <div
        className="relative z-10 w-full max-w-[410px] rounded-2xl bg-surface border border-border shadow-lg px-8 py-9 animate-[fadeIn_.3s_ease]"
        style={{ animation: 'fadeIn .3s ease' }}
      >
        {children}
      </div>
    </div>
  );
}
