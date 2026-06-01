// Button primitive. Variants mirror the .btn-* classes in design-handoff/styles.css
// (primary, ghost, outline, danger, danger-solid). Sizes: sm / md (default) / lg.
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-btn font-semibold border border-transparent whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-55 disabled:cursor-not-allowed active:translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-sm hover:bg-primary-dark',
        ghost: 'bg-transparent text-text hover:bg-slate-100',
        outline:
          'bg-surface text-text border-border hover:bg-bg hover:border-border-strong',
        danger:
          'bg-surface text-danger border-red-200 hover:bg-danger-soft',
        dangerSolid: 'bg-danger text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-4 text-[15px]',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
