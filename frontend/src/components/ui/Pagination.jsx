import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
  <div className="flex items-center justify-center gap-1">
  <button
  disabled={page <= 1}
  onClick={() => onChange(page - 1)}
  className="rounded-lg border border-border-default p-2 text-text-secondary transition-colors hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-ink-800"
  aria-label="Previous page"
  >
  <ChevronLeft className="h-4 w-4" />
  </button>
  {Array.from({ length: pages }).slice(0, 10).map((_, i) => {
  const n = i + 1;
  const isActive = n === page;
  return (
  <button
  key={n}
  onClick={() => onChange(n)}
  className={cn(
  'h-9 w-9 rounded-lg text-body-sm font-medium transition-colors',
  isActive
  ? 'bg-primary-600 text-white dark:bg-primary-500'
  : 'text-text-secondary hover:bg-slate-100 dark:hover:bg-ink-800'
  )}
  >
  {n}
  </button>
  );
  })}
  <button
  disabled={page >= pages}
  onClick={() => onChange(page + 1)}
  className="rounded-lg border border-border-default p-2 text-text-secondary transition-colors hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-ink-800"
  aria-label="Next page"
  >
  <ChevronRight className="h-4 w-4" />
  </button>
  </div>
  );
}