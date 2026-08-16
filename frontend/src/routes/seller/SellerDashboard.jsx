import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, ClipboardList, MessageSquare } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { formatDate } from '../../lib/utils.js';

export default function SellerDashboard() {
  const { data, isLoading } = useQuery({
  queryKey: ['seller-dashboard'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });

  if (isLoading) {
  return (
  <div className="space-y-4">
  <Skeleton className="h-24" />
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  <Skeleton className="h-64" />
  </div>
  );
  }

  const profile = data?.profile;
  const stats = data?.stats || {};
  const recentRequests = data?.recentRequests || [];

  return (
  <div className="space-y-6">
  {/* Status banner */}
  {profile?.status === 'pending' && (
  <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-light p-4 dark:bg-warning/10">
  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">Your storefront is under review</p>
  <p className="text-body-sm text-text-secondary">
  DreamEvents admins will review your profile before it goes live. You can keep preparing
  services, packages, gallery and menu in the meantime.
  </p>
  </div>
  </div>
  )}
  {profile?.status === 'rejected' && (
  <div className="flex items-start gap-3 rounded-xl border border-error/40 bg-error-light p-4 dark:bg-error/10">
  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">Your storefront was not approved</p>
  <p className="text-body-sm text-text-secondary">
  {profile.rejectionReason || 'Please fix the issues below and resubmit for review.'}
  </p>
  <Link to="/seller/settings" className="mt-1 inline-block text-body-sm font-medium text-error underline">
  Update profile & resubmit →
  </Link>
  </div>
  </div>
  )}
  {profile?.status === 'approved' && (
  <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success-light p-4 dark:bg-success/10">
  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
  <p className="text-body-sm text-text-secondary">
  <strong className="text-text-primary">You're live!</strong> Customers can now find and book you.
  </p>
  </div>
  )}

  {/* Stats */}
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {[
  { label: 'Open requests', value: stats.pendingRequests, icon: ClipboardList, to: '/seller/requests' },
  { label: 'Active bookings', value: stats.activeBookings, icon: CalendarDays, to: '/seller/bookings' },
  { label: 'Completed bookings', value: stats.completedBookings, icon: CheckCircle2, to: '/seller/bookings' },
  { label: 'Unread messages', value: stats.unreadMessages, icon: MessageSquare, to: '/seller/messages' },
  ].map((s) => (
  <Link key={s.label} to={s.to}>
  <Card hover>
  <CardBody className="flex items-center gap-4">
  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  <s.icon className="h-5 w-5" />
  </span>
  <div>
  <p className="font-geist text-h3 font-semibold text-text-primary">{s.value ?? 0}</p>
  <p className="text-micro text-text-tertiary">{s.label}</p>
  </div>
  </CardBody>
  </Card>
  </Link>
  ))}
  </div>

  {/* Recent requests */}
  <Card>
  <CardBody>
  <div className="flex items-center justify-between">
  <h3 className="font-geist text-h4 font-semibold text-text-primary">Latest booking requests</h3>
  <Link to="/seller/requests" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
  View all <ArrowRight className="h-3.5 w-3.5" />
  </Link>
  </div>

  <div className="mt-4 space-y-3">
  {recentRequests.length === 0 && (
  <EmptyState icon={ClipboardList} title="No requests yet" description="New booking requests will appear here the moment customers send them." />
  )}
  {recentRequests.map((r) => (
  <Link key={r._id} to="/seller/requests" className="block rounded-lg border border-border-subtle p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:hover:bg-ink-800">
  <div className="flex flex-wrap items-center justify-between gap-2">
  <div>
  <p className="font-geist text-body-sm font-semibold capitalize text-text-primary">{r.eventType} event</p>
  <p className="text-micro text-text-tertiary">
  {formatDate(r.eventDate)} · {r.guestCount} guests{r.budgetRange?.max ? ` · budget up to ${r.budgetRange.max.toLocaleString('en-PK')} PKR` : ''}
  </p>
  </div>
  <div className="flex items-center gap-3">
  {r.depositAmount > 0 && <Badge tone="gold">{r.depositAmount.toLocaleString('en-PK')} PKR deposit</Badge>}
  <StatusBadge status={r.status} />
  </div>
  </div>
  </Link>
  ))}
  </div>
  </CardBody>
  </Card>
  </div>
  );
}