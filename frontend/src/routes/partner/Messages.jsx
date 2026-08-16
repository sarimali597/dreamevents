import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { ThreadPanel } from '../../components/booking/ThreadPanel.jsx';
import { cn, formatDate, formatRelativeTime, initials } from '../../lib/utils.js';

export default function Messages() {
  const { user } = useAuth();
  const [active, setActive] = useState(null);

  const { data: threads, isLoading } = useQuery({
  queryKey: ['conversations'],
  queryFn: async () => unwrap(await api.get('/messages/conversations')),
  refetchInterval: 20_000,
  });

  const conversations = threads || [];
  const current = conversations.find((c) => c.bookingRequestId === active) || conversations[0] || null;

  const peerName = (t) => {
  if (user?.role === 'customer') return t.peer?.businessName || 'Vendor';
  if (user?.role === 'seller') return t.peer?.name || 'Customer';
  return t.peer?.seller?.businessName || t.peer?.customer?.name || 'Thread';
  };

  const peerAvatar = (t) => {
  const img = user?.role === 'customer' ? t.peer?.coverImage : null;
  return img;
  };

  return (
  <div className="space-y-4">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Messages</h2>
  <p className="text-body-sm text-text-tertiary">Chat with vendors about your requests</p>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
  {/* Thread list */}
  <div className="overflow-hidden rounded-xl border border-border-default bg-surface-raised lg:col-span-1">
  <div className="max-h-[600px] overflow-y-auto">
  {isLoading ? (
  <div className="space-y-2 p-3">
  {Array.from({ length: 4 }).map((_, i) => (
  <Skeleton key={i} className="h-16" />
  ))}
  </div>
  ) : conversations.length === 0 ? (
  <EmptyState
  icon={MessageSquare}
  title="No conversations"
  description="Send a booking request to any vendor and start chatting here."
  className="rounded-none border-0"
  />
  ) : (
  conversations.map((t) => {
  const isActive = current?.bookingRequestId === t.bookingRequestId;
  return (
  <button
  key={t.bookingRequestId}
  onClick={() => setActive(t.bookingRequestId)}
  className={cn(
  'flex w-full items-center gap-3 border-b border-border-subtle px-4 py-3 text-left transition-colors',
  isActive ? 'bg-primary-50 dark:bg-primary-900/30' : 'hover:bg-slate-50 dark:hover:bg-ink-800'
  )}
  >
  <div className="relative shrink-0">
  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  {peerAvatar(t) ? (
  <img src={peerAvatar(t)} alt="" className="h-full w-full object-cover" />
  ) : (
  initials(peerName(t))
  )}
  </div>
  {t.unreadCount > 0 && (
  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-ink-950">
  {t.unreadCount}
  </span>
  )}
  </div>
  <div className="min-w-0 flex-1">
  <div className="flex items-center justify-between gap-2">
  <p className="truncate font-geist text-body-sm font-semibold text-text-primary">{peerName(t)}</p>
  <StatusBadge status={t.status} />
  </div>
  <p className="truncate text-micro text-text-tertiary">
  {t.lastMessage?.content || `${t.eventType} · ${formatDate(t.eventDate)}`}
  </p>
  <p className="text-[10px] text-text-tertiary/70">
  {t.lastMessage ? formatRelativeTime(t.lastMessage.createdAt) : ''}
  </p>
  </div>
  </button>
  );
  })
  )}
  </div>
  </div>

  {/* Thread panel */}
  <div className="overflow-hidden rounded-xl border border-border-default bg-surface-raised lg:col-span-2">
  {current ? (
  <ThreadPanel requestId={current.bookingRequestId} className="h-[600px]" />
  ) : (
  <EmptyState icon={MessageSquare} title="Select a conversation" description="Pick a thread on the left to view messages." className="h-[600px] rounded-none border-0" />
  )}
  </div>
  </div>
  </div>
  );
}