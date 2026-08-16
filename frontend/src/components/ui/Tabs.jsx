import { cn } from '../../lib/utils.js';

export function Tabs({ tabs, active, onChange, className }) {
  return (
  <div className={cn('flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-ink-800', className)}>
  {tabs.map((tab) => {
  const isActive = active === tab.value;
  return (
  <button
  key={tab.value}
  onClick={() => onChange(tab.value)}
  className={cn(
  'whitespace-nowrap rounded-md px-3.5 py-1.5 text-body-sm font-medium transition-all',
  isActive
  ? 'bg-surface-raised text-primary-700 shadow-sm dark:bg-ink-700 dark:text-primary-400'
  : 'text-text-secondary hover:text-text-primary'
  )}
  >
  {tab.label}
  </button>
  );
  })}
  </div>
  );
}