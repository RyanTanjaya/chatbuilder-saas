// ChatBuilder wordmark — a serif "C" monogram set in Fraunces on the same 135°
// indigo gradient used for avatars across the app, with a warm-gold AI spark in
// the corner. The monogram echoes the serif wordmark so the mark and the name
// read as one system. Used at the top of the auth cards and the sidebar.
import { cn } from '@/lib/utils';

interface BrandProps {
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'light' | 'dark'; // dark = navy sidebar context (white name text)
  compact?: boolean; // hide the wordmark, render just the icon (collapsed sidebar)
}

export function Brand({ size = 'md', className, variant = 'light', compact = false }: BrandProps) {
  const box = size === 'sm' ? 28 : 34;
  const letterPx = Math.round(box * 0.66);
  const sparkPx = Math.round(box * 0.36);
  const nameSize = size === 'sm' ? 'text-[15px]' : 'text-[17px]';
  const nameColor = variant === 'dark' ? 'text-white' : 'text-text-strong';

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className="relative grid place-items-center rounded-[10px] flex-none"
        style={{
          width: box,
          height: box,
          background: 'linear-gradient(135deg,#3b3d80,#6c6ec2)',
          boxShadow: '0 4px 12px -2px rgba(59,61,128,.45)',
        }}
      >
        <span
          className="font-serif font-bold leading-none text-[#fffcf4]"
          style={{ fontSize: letterPx, marginTop: -1 }}
        >
          C
        </span>
        <svg
          className="absolute"
          style={{ top: Math.round(box * 0.08), right: Math.round(box * 0.08) }}
          width={sparkPx}
          height={sparkPx}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z"
            fill="#e8a838"
          />
        </svg>
      </span>
      {!compact && (
        <span className={cn('font-serif font-semibold tracking-tight', nameSize, nameColor)}>
          Chat<b>Builder</b>
        </span>
      )}
    </div>
  );
}
