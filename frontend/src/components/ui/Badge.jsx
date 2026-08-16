import { cn, statusClass } from '../../lib/utils.js';

export function Badge({ tone = 'neutral', className, children }) {
  const tones = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-ink-800 dark:text-ink-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-400',
  gold: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-400',
  success: 'bg-success-light text-success dark:bg-success/15 dark:text-success',
  warning: 'bg-warning-light text-warning dark:bg-warning/15 dark:text-warning',
  error: 'bg-error-light text-error dark:bg-error/15 dark:text-error',
  info: 'bg-info-light text-info dark:bg-info/15 dark:text-info',
  };
  return (
  <span
  className={cn(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-micro font-medium',
  tones[tone],
  className
  )}
  >
  {children}
  </span>
  );
}

export function StatusBadge({ status, className }) {
  return (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-medium', statusClass(status), className)}>
  <span className="h-1.5 w-1.5 rounded-full bg-current" />
  {status.replace(/_/g, ' ')}
  </span>
  );
}