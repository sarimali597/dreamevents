import { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils.js';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
  if (!open) return undefined;
  const onKey = (e) => e.key === 'Escape' && onClose?.();
  document.addEventListener('keydown', onKey);
  document.body.style.overflow = 'hidden';
  return () => {
  document.removeEventListener('keydown', onKey);
  document.body.style.overflow = '';
  };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
  <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
  <div
  className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
  onClick={onClose}
  aria-hidden="true"
  />
  <div
  role="dialog"
  aria-modal="true"
  className={cn(
  'relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-xl border border-border-default bg-surface-raised shadow-xl sm:rounded-xl',
  sizes[size]
  )}
  >
  <div className="flex items-center justify-between border-b border-border-default px-5 py-4">
  <h3 className="font-fraunces text-h3 text-text-primary">{title}</h3>
  <button
  onClick={onClose}
  className="rounded-full p-1.5 text-text-tertiary transition-colors hover:bg-slate-100 hover:text-text-primary dark:hover:bg-ink-800"
  aria-label="Close"
  >
  <X className="h-4 w-4" />
  </button>
  </div>
  <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
  {footer && <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">{footer}</div>}
  </div>
  </div>,
  document.body
  );
}