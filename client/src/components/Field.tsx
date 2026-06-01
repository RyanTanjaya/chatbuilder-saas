// Form field group: label (optional action on the right), input slot,
// optional hint or error text. Mirrors the .field structure from the handoff.
import type { ReactNode } from 'react';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  action?: ReactNode; // e.g. "Forgot password?" link on the right
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, action, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5 mb-4', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
