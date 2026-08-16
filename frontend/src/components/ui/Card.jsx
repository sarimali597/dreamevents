import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

/**
 * Card — the heart of the product (UI/UX Brief §5.2). The default now uses the
 * refined "elevated" treatment (soft layered shadow + lift on hover, theme-aware)
 * instead of a flat border-box. Use `plain` for nested/inset surfaces.
 */
export function Card({ className, hover = true, plain = false, children, ...props }) {
  return (
  <div
  className={cn(
  !plain && 'card-elevated rounded-xl',
  plain && 'rounded-xl border border-border-default bg-surface-raised',
  hover && !plain && 'cursor-default',
  className
  )}
  {...props}
  >
  {children}
  </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('font-geist text-h4 font-semibold text-text-primary', className)}>{children}</h3>;
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('border-t border-border-default p-4', className)}>{children}</div>;
}

/** Frosted glass panel — for hero overlays & floating UI (brief §9.1). */
export function GlassCard({ dark = false, className, children, ...props }) {
  return (
  <div
  className={cn(dark ? 'surface-glass-dark' : 'surface-glass', 'rounded-2xl', className)}
  {...props}
  >
  {children}
  </div>
  );
}

/** Stat tile for dashboards: icon chip + big number + label. */
export function StatCard({ icon: Icon, label, value, to, tone = 'primary' }) {
  const toneCls = {
  primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400',
  gold: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-400',
  success: 'bg-success-light text-success dark:bg-success/15 dark:text-success',
  warning: 'bg-warning-light text-warning dark:bg-warning/15 dark:text-warning',
  }[tone];

  const inner = (
  <Card hover={!!to}>
  <CardBody className="flex items-center gap-4">
  {Icon && (
  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneCls)}>
  <Icon className="h-5 w-5" />
  </span>
  )}
  <div className="min-w-0">
  <p className="font-geist text-h3 font-semibold tabular text-text-primary">{value ?? 0}</p>
  <p className="truncate text-micro text-text-tertiary">{label}</p>
  </div>
  </CardBody>
  </Card>
  );

  return to ? <Link to={to}>{inner}</Link> : inner;
}
