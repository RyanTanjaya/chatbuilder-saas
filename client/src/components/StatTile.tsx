// Stat tile — icon-on-soft-bg + big number + label, with optional ±trend pill.
// Variants map onto the ACCENTS dict from the handoff (indigo/purple/green/amber).
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AccentKey = 'indigo' | 'purple' | 'green' | 'amber';

const ACCENT_STYLES: Record<AccentKey, { soft: string; text: string }> = {
  indigo: { soft: 'bg-primary-light', text: 'text-primary-dark' },
  purple: { soft: 'bg-accent-purple-soft', text: 'text-accent-purple' },
  green: { soft: 'bg-success-soft', text: 'text-success' },
  amber: { soft: 'bg-warning-soft', text: 'text-warning' },
};

interface StatTileProps {
  icon: LucideIcon;
  color: AccentKey;
  num: string | number;
  label: string;
  trend?: number; // percent; positive = up, negative = down
}

export function StatTile({ icon: Icon, color, num, label, trend }: StatTileProps) {
  const s = ACCENT_STYLES[color];
  return (
    <div className="bg-surface border border-border rounded-card p-4.5 shadow-sm" style={{ padding: 18 }}>
      <div
        className={cn(
          'grid place-items-center w-[38px] h-[38px] rounded-[10px] mb-3',
          s.soft,
          s.text
        )}
      >
        <Icon size={20} />
      </div>
      <div className="font-serif text-[32px] font-semibold text-text-strong tracking-tight leading-none tabular-nums">
        {num}
      </div>
      <div className="text-[13px] text-text-muted mt-1.5 font-medium">{label}</div>
      {trend != null ? (
        <div
          className={cn(
            'text-xs font-bold inline-flex items-center gap-1 mt-2',
            trend >= 0 ? 'text-success' : 'text-danger'
          )}
        >
          {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trend)}% this month
        </div>
      ) : null}
    </div>
  );
}
