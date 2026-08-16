import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

/**
 * Theme provider for the DreamEvents SPA.
 *
 * PRD §7: "Dark mode and light mode, user-toggleable, system-preference default."
 * Replaces `next-themes` (a Next.js-only library) with a dependency-free
 * implementation that toggles the `.dark` class consumed by globals.css.
 */

const STORAGE_KEY = 'dreamevents-theme';
const ThemeContext = createContext(null);

function systemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStored() {
  try {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
  return null;
  }
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  // `theme` is the user's choice: 'light' | 'dark' | 'system'
  const [theme, setThemeState] = useState(() => readStored() || defaultTheme);
  // `resolvedTheme` is what is actually painted: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState(() =>
  (readStored() || defaultTheme) === 'system' ? systemTheme() : readStored() || defaultTheme
  );

  // Apply the theme, and follow the OS when the choice is 'system'.
  useEffect(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const resolve = () => {
  const next = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme;
  setResolvedTheme(next);
  applyTheme(next);
  };

  resolve();

  if (theme === 'system') {
  mq.addEventListener('change', resolve);
  return () => mq.removeEventListener('change', resolve);
  }
  return undefined;
  }, [theme]);

  const setTheme = useCallback((next) => {
  setThemeState(next);
  try {
  localStorage.setItem(STORAGE_KEY, next);
  } catch {
  /* storage unavailable (private mode) — theme still applies for this session */
  }
  }, []);

  const toggleTheme = useCallback(() => {
  setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
  () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
  [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
