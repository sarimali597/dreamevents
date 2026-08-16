import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '../../lib/api.js';
import { cn, formatRelativeTime } from '../../lib/utils.js';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, refetch } = useQuery({
  queryKey: ['notifications'],
  queryFn: async () => unwrap(await api.get('/notifications?limit=10')),
  refetchInterval: 25_000,
  });

  useEffect(() => {
  const onClick = (e) => {
  if (ref.current && !ref.current.contains(e.target)) setOpen(false);
  };
  document.addEventListener('mousedown', onClick);
  return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  const markAll = async () => {
  await api.post('/notifications/read-all');
  await refetch();
  qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const openNotif = (n) => {
  setOpen(false);
  if (n.link) navigate(n.link);
  };

  return (
  <div className="relative" ref={ref}>
  <button
  onClick={() => setOpen((v) => !v)}
  className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 text-primary-600 transition-colors hover:bg-primary-50 dark:border-ink-700 dark:text-primary-500 dark:hover:bg-ink-800"
  aria-label="Notifications"
  >
  <Bell className="h-4 w-4" />
  {unread > 0 && (
  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-ink-950">
  {unread > 9 ? '9+' : unread}
  </span>
  )}
  </button>

  {open && (
  <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border-default bg-surface-raised shadow-xl">
  <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
  <h4 className="font-geist text-sm font-semibold text-text-primary">Notifications</h4>
  {unread > 0 && (
  <button
  onClick={markAll}
  className="inline-flex items-center gap-1 text-micro font-medium text-primary-600 hover:underline dark:text-primary-400"
  >
  <CheckCheck className="h-3 w-3" />
  Mark all read
  </button>
  )}
  </div>
  <div className="max-h-80 overflow-y-auto">
  {notifications.length === 0 ? (
  <p className="px-4 py-8 text-center text-body-sm text-text-tertiary">No notifications yet</p>
  ) : (
  notifications.map((n) => (
  <button
  key={n._id}
  onClick={() => openNotif(n)}
  className={cn(
  'block w-full border-b border-border-subtle px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-ink-800',
  !n.isRead && 'bg-primary-50/60 dark:bg-primary-900/20'
  )}
  >
  <div className="flex items-start gap-2.5">
  {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />}
  <div className="min-w-0">
  <p className="truncate text-body-sm font-medium text-text-primary">{n.title}</p>
  <p className="mt-0.5 line-clamp-2 text-micro text-text-secondary">{n.body}</p>
  <p className="mt-1 text-micro text-text-tertiary">{formatRelativeTime(n.createdAt)}</p>
  </div>
  </div>
  </button>
  ))
  )}
  </div>
  </div>
  )}
  </div>
  );
}