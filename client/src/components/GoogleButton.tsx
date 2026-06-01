// Placeholder Google sign-in button. Wired up to nothing for now — real OAuth
// is out of scope for the portfolio MVP. Click shows a quick "coming soon" toast.
import { cn } from '@/lib/utils';

interface GoogleButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function GoogleButton({ label, onClick, className }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full h-11 items-center justify-center gap-2.5 rounded-btn border border-border bg-surface text-sm font-semibold text-text-strong hover:bg-bg hover:border-border-strong transition-colors',
        className
      )}
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 43.5c5.2 0 9.9-2 13.5-5.2l-6.2-5.3c-2 1.5-4.6 2.4-7.3 2.4-5.2 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.2 5.3c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.3-.4-3.5z"
        />
      </svg>
      {label}
    </button>
  );
}
