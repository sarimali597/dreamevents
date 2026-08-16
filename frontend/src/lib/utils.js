import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount, currency = 'PKR') {
  return new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-PK').format(Number(n) || 0);
}

export function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function slugify(text) {
  return String(text)
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
}

export function initials(name) {
  if (!name) return '?';
  return name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0].toUpperCase())
  .join('');
}

export function isFuture(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export function daysBetween(a, b) {
  const A = new Date(a).setHours(0, 0, 0, 0);
  const B = new Date(b).setHours(0, 0, 0, 0);
  return Math.round((B - A) / 86400000);
}

/* ── Status → UI metadata (colors follow UI/UX Brief §2.6) ── */

const STATUS_STYLES = {
  success: 'bg-success-light text-success dark:bg-success/15 dark:text-success',
  warning: 'bg-warning-light text-warning dark:bg-warning/15 dark:text-warning',
  error: 'bg-error-light text-error dark:bg-error/15 dark:text-error',
  info: 'bg-info-light text-info dark:bg-info/15 dark:text-info',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-ink-800 dark:text-ink-300',
  gold: 'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-400',
};

const STATUS_LABELS = {
  pending: 'Pending',
  seller_replied: 'Seller replied',
  estimate_sent: 'Estimate sent',
  negotiating: 'Negotiating',
  accepted: 'Accepted',
  cancelled: 'Cancelled',
  expired: 'Expired',
  rejected: 'Rejected',
  confirmed: 'Confirmed',
  completed: 'Completed',
  approved: 'Approved',
  suspended: 'Suspended',
  draft: 'Draft',
  onboarding: 'Onboarding',
  active: 'Active',
  open: 'Open',
  under_review: 'Under review',
  resolved: 'Resolved',
  dismissed: 'Dismissed',
  deposit_received: 'Deposit received',
  balance_received: 'Balance received',
  refunded: 'Refunded',
};

const STATUS_COLOR = {
  pending: 'warning',
  seller_replied: 'info',
  estimate_sent: 'info',
  negotiating: 'warning',
  accepted: 'success',
  confirmed: 'success',
  completed: 'success',
  approved: 'success',
  active: 'success',
  deposit_received: 'success',
  balance_received: 'success',
  cancelled: 'error',
  expired: 'error',
  rejected: 'error',
  suspended: 'error',
  draft: 'neutral',
  onboarding: 'neutral',
  open: 'warning',
  under_review: 'warning',
  resolved: 'success',
  dismissed: 'neutral',
  refunded: 'neutral',
};

export function statusMeta(status) {
  return {
  label: STATUS_LABELS[status] || String(status).replace(/_/g, ' '),
  color: STATUS_COLOR[status] || 'neutral',
  };
}

export function statusClass(status) {
  const { color } = statusMeta(status);
  return STATUS_STYLES[color];
}
