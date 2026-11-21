import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'default';
  size?: 'sm' | 'md' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-[6px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    // Map 'default' alias to 'primary' for compatibility
    const actualVariant = variant === 'default' ? 'primary' : variant;

    const variants = {
      primary: 'bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-hover',
      secondary: 'border border-border-subtle bg-bg-card text-text-primary hover:bg-bg-hover hover:border-border-strong',
      ghost: 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
      destructive: 'bg-danger text-white hover:bg-danger/90',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-base gap-2',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[actualVariant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
