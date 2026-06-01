// App shell — sidebar + sticky topbar + content. Used by every authed screen.
// Topbar takes a title/subtitle pair or a custom node, plus action slot on the
// right. Mobile sidebar slide-out is deferred until we wire breakpoints later.
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface ShellProps {
  title?: string;
  subtitle?: string;
  header?: ReactNode; // custom header content; overrides title/subtitle when set
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function Shell({ title, subtitle, header, actions, children, contentClassName }: ShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px] min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-border px-8 py-4 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {header ? (
              header
            ) : (
              <>
                {title ? (
                  <h1 className="text-[22px] font-extrabold text-text-strong tracking-tight">
                    {title}
                  </h1>
                ) : null}
                {subtitle ? (
                  <div className="text-[13px] text-text-muted mt-0.5">{subtitle}</div>
                ) : null}
              </>
            )}
          </div>
          {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
        </header>
        <div className={cn('px-8 py-7 pb-14 animate-[fadeIn_.3s_ease]', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
