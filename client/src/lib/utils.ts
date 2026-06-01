// shadcn-style class merger. Used everywhere components compose Tailwind classes.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Compact relative time ("just now", "5m", "3h", "2d") for activity lists,
// falling back to an absolute date once a thread is more than a week old.
export function timeAgo(input: string | Date): string {
  const then = new Date(input).getTime();
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(input).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDateTime(input: string | Date): string {
  return new Date(input).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
