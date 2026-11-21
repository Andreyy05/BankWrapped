import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'destructive' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-btn text-xs font-medium border';

  const variants = {
    default: 'bg-accent-subtle text-accent border-accent/20',
    secondary: 'bg-bg-subtle text-text-secondary border-border-subtle',
    outline: 'bg-transparent text-text-secondary border-border-subtle',
    success: 'bg-income-subtle text-income border-income/20',
    destructive: 'bg-danger-subtle text-danger border-danger/20',
    warning: 'bg-warning-subtle text-warning border-warning/20',
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
