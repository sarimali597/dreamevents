import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function AdminBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
  queryKey: ['admin-bookings', page, status],
  queryFn: async () =>
  unwrap(await api.get('/admin/bookings', { params: { page, limit: 10, status: status || undefined } })),
  });
  const bookings = data?.bookings || [];

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Bookings</h2>
  <p className="text-body-sm text-text-tertiary">Every confirmed booking on the platform.</p>
  </div>

  <select
  value={status}
  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
  className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="">All statuses</option>
  <option value="booked">Booked</option>
  <option value="confirmed">Confirmed</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
  <option value="refunded">Refunded</option>
  </select>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : bookings.length === 0 ? (
  <EmptyState icon={CalendarDays} title="No bookings found" description="Try a different status filter." />
  ) : (
  <div className="space-y-3">
  {bookings.map((b) => (
  <Card key={b._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <p className="font-geist text-body-lg font-semibold capitalize text-text-primary">{b.eventType} event</p>
  <StatusBadge status={b.status} />
  </div>
  <p className="text-body-sm text-text-tertiary">
  {formatDate(b.eventDate)} · {b.guestCount} guests
  </p>
  <p className="text-micro text-text-tertiary">
  Seller: {b.sellerId?.businessName || '—'} · Customer: {b.userId?.name || '—'} ({b.userId?.email || '—'})
  </p>
  </div>
  <div className="text-right">
  <p className="font-geist text-h4 font-semibold text-primary-600 dark:text-primary-400">{formatPrice(b.totalAmount)}</p>
  <p className="text-micro text-text-tertiary">
  {formatPrice(b.depositAmount)} deposit · {formatPrice(b.balanceAmount)} balance
  </p>
  </div>
  </div>
  </CardBody>
  </Card>
  ))}
  </div>
  )}

  {data?.pages > 1 && (
  <Pagination page={page} pages={data.pages} total={data.total} onChange={setPage} />
  )}
  </div>
  );
}