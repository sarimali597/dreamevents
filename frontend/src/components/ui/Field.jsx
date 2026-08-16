import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils.js';

const baseField =
  'w-full rounded-lg border border-border-default bg-surface-sunken px-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef(function Input({ label, error, hint, className, id, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
  <label className="block" htmlFor={fieldId}>
  {label && (
  <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">{label}</span>
  )}
  <input ref={ref} id={fieldId} className={cn(baseField, 'h-10', error && 'border-error', className)} {...props} />
  {hint && !error && <span className="mt-1 block text-micro text-text-tertiary">{hint}</span>}
  {error && <span className="mt-1 block text-micro text-error">{error}</span>}
  </label>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className, id, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
  <label className="block" htmlFor={fieldId}>
  {label && (
  <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">{label}</span>
  )}
  <textarea
  ref={ref}
  id={fieldId}
  className={cn(baseField, 'min-h-24 py-2', error && 'border-error', className)}
  {...props}
  />
  {hint && !error && <span className="mt-1 block text-micro text-text-tertiary">{hint}</span>}
  {error && <span className="mt-1 block text-micro text-error">{error}</span>}
  </label>
  );
});

export const Select = forwardRef(function Select({ label, error, children, className, id, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
  <label className="block" htmlFor={fieldId}>
  {label && (
  <span className="mb-1.5 block text-body-sm font-medium text-text-secondary">{label}</span>
  )}
  <select ref={ref} id={fieldId} className={cn(baseField, 'h-10 cursor-pointer', error && 'border-error', className)} {...props}>
  {children}
  </select>
  {error && <span className="mt-1 block text-micro text-error">{error}</span>}
  </label>
  );
});