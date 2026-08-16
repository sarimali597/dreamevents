import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider.jsx';
import { cn } from '../../lib/utils.js';

/**
 * Theme toggle — cycles light → dark → system.
 * Icon reflects the user's *choice* (so "system" is discoverable), while the
 * page paints `resolvedTheme`. Brief §11: labeled for assistive tech.
 */
export default function ThemeToggle({ className }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
  const Icon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Sun : Moon;

  const label =
  theme === 'system'
  ? `Theme: follows system (${resolvedTheme}). Switch to light.`
  : `Theme: ${theme}. Switch to ${next}.`;

  return (
  <button
  type="button"
  aria-label={label}
  title={label}
  onClick={() => setTheme(next)}
  className={cn(
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-all',
  'hover:bg-primary-50 active:scale-95',
  'dark:border-ink-700 dark:text-primary-400 dark:hover:bg-ink-800',
  className
  )}
  >
  <Icon className="h-4 w-4" />
  </button>
  );
}
