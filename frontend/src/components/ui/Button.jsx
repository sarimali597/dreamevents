import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const VARIANTS = {
  primary:
  'bg-primary-600 text-white shadow-sm hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
  gold: 'bg-accent-500 text-ink-950 shadow-sm hover:bg-accent-600 focus-visible:ring-accent-500',
  secondary:
  'bg-ink-50 text-ink-900 hover:bg-ink-100 focus-visible:ring-ink-400 dark:bg-ink-800 dark:text-slate-50 dark:hover:bg-ink-700',
  outline:
  'border border-border-default bg-transparent text-text-primary hover:bg-slate-50 focus-visible:ring-primary-400 dark:hover:bg-ink-800',
  ghost: 'text-text-secondary hover:bg-slate-100 hover:text-text-primary focus-visible:ring-primary-400 dark:hover:bg-ink-800',
  danger: 'bg-error text-white hover:bg-red-700 focus-visible:ring-error',
  'danger-outline': 'border border-error/50 text-error hover:bg-error-light focus-visible:ring-error',
  sheen: 'btn-sheen bg-primary-600 text-white shadow-md hover:bg-primary-700 focus-visible:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, className, children, ...props },
  ref
) {
  return (
  <button
  ref={ref}
  disabled={disabled || loading}
  className={cn(
  'relative inline-flex select-none items-center justify-center overflow-hidden rounded-lg font-medium transition-all',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
  'disabled:cursor-not-allowed disabled:opacity-60',
  VARIANTS[variant],
  SIZES[size],
  variant === 'primary' &&
  'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/25 after:to-transparent after:transition-transform after:duration-700 hover:after:translate-x-full',
  className
  )}
  {...props}
  >
  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
  {children}
  </button>
  );
});

export { Button };