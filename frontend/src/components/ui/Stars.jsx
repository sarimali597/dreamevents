import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Stars({ value = 0, size = 'h-4 w-4', showValue = false, className }) {
  const full = Math.floor(value);
  const half = value - full >= 0.4;
  return (
  <span className={cn('inline-flex items-center gap-0.5 text-accent-500', className)} aria-label={`${value} out of 5 stars`}>
  {Array.from({ length: 5 }).map((_, i) => {
  if (i < full) return <Star key={i} className={cn(size, 'fill-current')} />;
  if (i === full && half) return <StarHalf key={i} className={cn(size, 'fill-current')} />;
  return <Star key={i} className={cn(size, 'text-accent-200 dark:text-ink-700')} />;
  })}
  {showValue && <span className="ml-1.5 text-micro font-medium text-text-secondary">{value?.toFixed(1)}</span>}
  </span>
  );
}