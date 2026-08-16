import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, CalendarDays, ClipboardList, MessageSquare, Sparkles } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { formatDate, formatPrice, formatRelativeTime } from '../../lib/utils.js';

export default function CustomerHome() {
  const { data: bookings } = useQuery({
  queryKey: ['bookings'],
  queryFn: async () => unwrap(await api.get('/bookings', { params: { limit: 5 } })),
  });
  const { data: requests } = useQuery({
  queryKey: ['requests'],
  queryFn: async () => unwrap(await api.get('/booking-requests', { params: { limit: 5 } })),
  });
  const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: async () => unwrap(await api.get('/notifications', { params: { limit: 5 } })),
  });
  const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: async () => unwrap(await api.get('/events')),
  });

  const bookingsList = bookings?.bookings || [];
  const requestsList = requests?.requests || [];
  const notifList = notifications?.notifications || [];
  const eventsList = events || [];

  const upcoming = bookingsList.filter((b) => b.status === 'confirmed');
  const pendingRequests = requestsList.filter((r) => ['pending', 'seller_replied', 'estimate_sent', 'negotiating'].includes(r.status));

  const stats = [
  { label: 'Active bookings', value: upcoming.length, icon: CalendarDays, to: '/customer/bookings' },
  { label: 'Open requests', value: pendingRequests.length, icon: ClipboardList, to: '/customer/requests' },
  { label: 'My events', value: eventsList.length, icon: Sparkles, to: '/customer/events' },
  { label: 'Unread notifications', value: notifications?.unreadCount || 0, icon: Bell, to: '/customer' },
  ];

  return (
  <div className="space-y-8">
  {/* Stats */}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map((s) => (
  <Link key={s.label} to={s.to}>
  <Card hover>
  <CardBody className="flex items-center gap-4">
  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  <s.icon className="h-5 w-5" />
  </span>
  <div>
  <p className="font-geist text-h3 font-semibold text-text-primary">{s.value}</p>
  <p className="text-micro text-text-tertiary">{s.label}</p>
  </div>
  </CardBody>
  </Card>
  </Link>
  ))}
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
  {/* Bookings */}
  <Card className="lg:col-span-2">
  <CardBody>
  <div className="flex items-center justify-between">
  <CardTitle>Your bookings</CardTitle>
  <Link to="/customer/bookings" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
  View all <ArrowRight className="h-3.5 w-3.5" />
  </Link>
  </div>
  <div className="mt-4 space-y-3">
  {bookingsList.length === 0 && (
  <EmptyState icon={CalendarDays} title="No bookings yet" description="Send a booking request to any vendor and it will show up here." />
  )}
  {bookingsList.map((b) => (
  <Link key={b._id} to={`/customer/bookings/${b._id}`} className="block rounded-lg border border-border-subtle p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:hover:bg-ink-800">
  <div className="flex flex-wrap items-center justify-between gap-2">
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">{b.sellerId?.businessName}</p>
  <p className="text-micro text-text-tertiary">
  {b.eventType} · {formatDate(b.eventDate)} · {b.guestCount} guests
  </p>
  </div>
  <div className="flex items-center gap-3">
  <span className="font-geist text-body-sm font-semibold text-primary-700 dark:text-primary-400">{formatPrice(b.totalAmount)}</span>
  <StatusBadge status={b.status} />
  </div>
  </div>
  </Link>
  ))}
  </div>
  </CardBody>
  </Card>

  {/* Recent activity */}
  <Card>
  <CardBody>
  <CardTitle>Recent activity</CardTitle>
  <div className="mt-4 space-y-3">
  {notifList.length === 0 && <p className="text-body-sm text-text-tertiary">Nothing yet — your notifications will appear here.</p>}
  {notifList.map((n) => (
  <div key={n._id} className="flex items-start gap-3">
  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-slate-300 dark:bg-ink-600' : 'bg-accent-500'}`} />
  <div className="min-w-0">
  <p className="truncate text-body-sm font-medium text-text-primary">{n.title}</p>
  <p className="text-micro text-text-tertiary">{formatRelativeTime(n.createdAt)}</p>
  </div>
  </div>
  ))}
  </div>
  <Link to="/customer/messages" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-default py-2.5 text-body-sm font-medium text-text-secondary transition-colors hover:border-primary-300 hover:text-primary-600">
  <MessageSquare className="h-4 w-4" />
  Open messages
  </Link>
  </CardBody>
  </Card>
  </div>

  {/* Pending requests strip */}
  {pendingRequests.length > 0 && (
  <Card>
  <CardBody>
  <div className="flex items-center justify-between">
  <CardTitle>Waiting for quotes</CardTitle>
  <Link to="/customer/requests" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
  View all <ArrowRight className="h-3.5 w-3.5" />
  </Link>
  </div>
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {pendingRequests.map((r) => (
  <Link key={r._id} to={`/customer/requests/${r._id}`} className="rounded-lg border border-border-subtle p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:hover:bg-ink-800">
  <div className="flex items-center justify-between">
  <p className="font-geist text-body-sm font-semibold capitalize text-text-primary">{r.eventType}</p>
  <StatusBadge status={r.status} />
  </div>
  <p className="mt-1 text-micro text-text-tertiary">
  {formatDate(r.eventDate)} · {r.guestCount} guests
  </p>
  </Link>
  ))}
  </div>
  </CardBody>
  </Card>
  )}
  </div>
  );
}