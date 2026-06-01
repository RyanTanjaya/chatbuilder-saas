// Input primitive. Mirrors the .input styles from design-handoff/styles.css
// (42px tall, slate border, indigo focus ring, soft red error state).
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'h-[42px] w-full rounded-input bg-surface px-3.5 text-sm text-text-strong border outline-none transition placeholder:text-slate-400 disabled:opacity-50',
          hasError
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
