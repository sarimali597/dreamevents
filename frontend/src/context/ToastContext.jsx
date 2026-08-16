import { createContext, useCallback, useContext, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils.js';

const ToastContext = createContext(null);
let toastId = 0;

const STYLES = {
  success: { icon: CheckCircle2, ring: 'border-success/40 text-success' },
  error: { icon: AlertTriangle, ring: 'border-error/40 text-error' },
  info: { icon: Info, ring: 'border-primary-300 text-primary-600 dark:text-primary-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message) => {
  const id = ++toastId;
  setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
  setTimeout(() => dismiss(id), 4600);
  }, [dismiss]);

  const value = {
  success: (m) => push('success', m),
  error: (m) => push('error', m),
  info: (m) => push('info', m),
  };

  return (
  <ToastContext.Provider value={value}>
  {children}
  <div className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-2">
  {toasts.map((t) => {
  const s = STYLES[t.type];
  const Icon = s.icon;
  return (
  <div
  key={t.id}
  className={cn(
  'pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface-raised p-3 shadow-lg',
  s.ring
  )}
  >
  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
  <p className="flex-1 text-sm text-text-primary">{t.message}</p>
  <button
  onClick={() => dismiss(t.id)}
  className="text-text-tertiary transition-colors hover:text-text-primary"
  aria-label="Dismiss"
  >
  <X className="h-3.5 w-3.5" />
  </button>
  </div>
  );
  })}
  </div>
  </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
