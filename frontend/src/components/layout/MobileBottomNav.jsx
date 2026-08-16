import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

/**
 * MobileBottomNav — fixed bottom tab bar for the dashboard areas on <lg screens
 * (UI/UX Design Brief §9.5: 4–5 items, active = primary-600 + filled icon,
 * safe-area padding). Desktop keeps the full sidebar; this is mobile-only.
 *
 * `items` is the same shape as the DashboardLayout SECTIONS entries that are
 * deemed primary enough to surface as a tab.
 */
export function MobileBottomNav({ items }) {
  if (!items?.length) return null;

  return (
  <nav
  aria-label="Primary"
  className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border-default bg-surface-raised/95 backdrop-blur-md lg:hidden"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
  >
  {items.map((item) => (
  <NavLink
  key={item.to}
  to={item.to}
  end={item.end}
  className={({ isActive }) =>
  cn(
  'group relative flex flex-1 flex-col items-center justify-center gap-0.5 text-micro font-medium transition-colors',
  isActive
  ? 'text-primary-600 dark:text-primary-400'
  : 'text-text-tertiary hover:text-text-secondary'
  )
  }
  >
  {({ isActive }) => (
  <>
  {/* active indicator bar */}
  <span
  className={cn(
  'absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity',
  isActive ? 'bg-primary-600 opacity-100 dark:bg-primary-400' : 'opacity-0'
  )}
  />
  <item.icon
  className={cn('h-5 w-5', isActive && 'fill-primary-600/15 dark:fill-primary-400/15')}
  strokeWidth={isActive ? 2.4 : 1.8}
  />
  <span className="truncate px-1 leading-none">{item.label}</span>
  </>
  )}
  </NavLink>
  ))}
  </nav>
  );
}

export default MobileBottomNav;
