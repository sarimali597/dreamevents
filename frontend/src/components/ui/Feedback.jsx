import { cn } from '../../lib/utils.js';

export function Spinner({ className, variant = 'ring' }) {
  if (variant === 'dots') {
  return (
  <span className={cn('inline-flex items-center gap-1', className)} aria-label="Loading">
  {[0, 1, 2].map((i) => (
  <span
  key={i}
  className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-600 dark:bg-primary-400"
  style={{ animationDelay: `${i * 0.15}s` }}
  />
  ))}
  </span>
  );
  }
  return (
  <span
  className={cn(
  'inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 dark:border-ink-700 dark:border-t-primary-400',
  className
  )}
  aria-label="Loading"
  />
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-ink-800', className)} />;
}

export function PageLoader() {
  return (
  <div className="flex min-h-screen items-center justify-center bg-surface-base">
  <div className="flex flex-col items-center gap-5">
  <div className="relative h-14 w-14">
  {/* dual-ring branded spinner (re-skinned from onlineComponents/loader1) */}
  <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary-100 border-r-primary-600 dark:border-ink-700 dark:border-r-primary-400" style={{ animationDuration: '1.1s' }} />
  <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-accent-100 border-t-accent-500 dark:border-ink-800 dark:border-t-accent-400" style={{ animationDuration: '1.8s', animationDirection: 'reverse' }} />
  </div>
  <p className="font-fraunces text-sm font-medium tracking-wide text-text-tertiary">DreamEvents</p>
  </div>
  </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-default px-6 py-16 text-center">
  {Icon && (
  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  <Icon className="h-6 w-6" />
  </div>
  )}
  <h3 className="font-fraunces text-h3 text-text-primary">{title}</h3>
  {description && <p className="mt-2 max-w-sm text-body-sm text-text-secondary">{description}</p>}
  {action && <div className="mt-6">{action}</div>}
  </div>
  );
}