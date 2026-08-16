import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Flag, FolderTree, ShoppingBag, Users } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
  queryKey: ['admin-stats'],
  queryFn: async () => unwrap(await api.get('/admin/stats')),
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

  const s = data || {};

  const cards = [
  {
  label: 'Customers',
  value: s.users?.customers,
  icon: Users,
  tone: 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900',
  to: '/admin/users',
  },
  {
  label: 'Sellers',
  value: `${s.users?.approvedSellers ?? 0} / ${s.users?.sellers ?? 0} live`,
  icon: ShoppingBag,
  tone: 'text-accent-600 dark:text-accent-500 bg-accent-100 dark:bg-accent-500/15',
  to: '/admin/sellers',
  },
  {
  label: 'Bookings',
  value: s.bookings?.total,
  icon: CalendarDays,
  tone: 'text-success bg-success-light dark:bg-success/10',
  to: '/admin/bookings',
  },
  {
  label: 'Open reports',
  value: s.moderation?.openReports,
  icon: Flag,
  tone: 'text-error bg-error-light dark:bg-error/10',
  to: '/admin/moderation',
  },
  ];

  return (
  <div className="space-y-6">
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {cards.map((c) => (
  <Link key={c.label} to={c.to}>
  <Card hover>
  <CardBody className="flex items-center gap-4">
  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.tone}`}>
  <c.icon className="h-5 w-5" />
  </span>
  <div>
  <p className="font-geist text-h3 font-semibold text-text-primary">{c.value ?? 0}</p>
  <p className="text-micro text-text-tertiary">{c.label}</p>
  </div>
  </CardBody>
  </Card>
  </Link>
  ))}
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
  <Card>
  <CardBody>
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">Revenue</h3>
  <div className="mt-3 space-y-3">
  <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
  <span className="text-body-sm text-text-secondary">Deposits received</span>
  <span className="font-geist text-h4 font-semibold text-success">{formatPrice(s.revenue || 0)}</span>
  </div>
  <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
  <span className="text-body-sm text-text-secondary">Support revenue</span>
  <span className="font-geist text-h4 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(s.supportRevenue || 0)}</span>
  </div>
  <div className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
  <span className="text-body-sm text-text-secondary">Categories</span>
  <span className="font-geist text-h4 font-semibold text-text-primary">{s.categories || 0}</span>
  </div>
  </div>
  <Link to="/admin/catalog" className="mt-3 inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
  Manage catalog <ArrowRight className="h-3.5 w-3.5" />
  </Link>
  </CardBody>
  </Card>

  <Card className="lg:col-span-2">
  <CardBody>
  <div className="flex items-center justify-between">
  <h3 className="font-geist text-body-lg font-semibold text-text-primary">Recent admin activity</h3>
  <FolderTree className="h-4 w-4 text-text-tertiary" />
  </div>
  <div className="mt-3 space-y-2">
  {(s.recentActivity || []).length === 0 && (
  <p className="text-body-sm text-text-tertiary">No activity logged yet.</p>
  )}
  {(s.recentActivity || []).map((a) => (
  <div key={a._id} className="flex items-center justify-between rounded-lg border border-border-subtle px-3 py-2">
  <div>
  <p className="text-body-sm font-medium capitalize text-text-primary">{a.action.replace(/_/g, ' ')}</p>
  <p className="text-micro text-text-tertiary">
  {a.targetType} · {formatDate(a.createdAt)}
  </p>
  </div>
  <span className="text-micro text-text-tertiary">{a.ipAddress || '—'}</span>
  </div>
  ))}
  </div>
  </CardBody>
  </Card>
  </div>
  </div>
  );
}