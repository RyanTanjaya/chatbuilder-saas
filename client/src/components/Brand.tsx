// ChatBuilder wordmark — indigo speech-bubble icon with a yellow sparkle accent.
// Used at the top of the auth cards and the sidebar.
import { MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandProps {
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'light' | 'dark'; // dark = navy sidebar context (white name text)
  compact?: boolean; // hide the wordmark, render just the icon (collapsed sidebar)
}

export function Brand({ size = 'md', className, variant = 'light', compact = false }: BrandProps) {
  const boxSize = size === 'sm' ? 'w-7 h-7' : 'w-[34px] h-[34px]';
  const iconSize = size === 'sm' ? 16 : 19;
  const sparkleSize = size === 'sm' ? 10 : 13;
  const nameSize = size === 'sm' ? 'text-[15px]' : 'text-[17px]';
  const nameColor = variant === 'dark' ? 'text-white' : 'text-text-strong';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative grid place-items-center rounded-[9px] bg-primary text-white shadow-md',
          boxSize
        )}
        style={{ boxShadow: '0 2px 8px rgba(99,102,241,.5)' }}
      >
        <MessageSquare size={iconSize} />
        <span className="absolute -top-1.5 -right-1.5 grid place-items-center w-4 h-4 text-yellow-300">
          <Sparkles size={sparkleSize} fill="currentColor" />
        </span>
      </span>
      {!compact && (
        <span className={cn('font-extrabold tracking-tight', nameSize, nameColor)}>
          Chat<b>Builder</b>
        </span>
      )}
    </div>
  );
}
