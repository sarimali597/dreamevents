import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate, formatPrice } from '../../lib/utils.js';

export default function MyBookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
  queryKey: ['bookings', { page, status }],
  queryFn: async () =>
  unwrap(await api.get('/bookings', { params: { page, limit: 10, status: status || undefined } })),
  });

  const bookings = data?.bookings || [];

  return (
  <div className="space-y-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">My bookings</h2>
  <p className="text-body-sm text-text-tertiary">Confirmed bookings with your vendors</p>
  </div>
  <select
  value={status}
  onChange={(e) => {
  setStatus(e.target.value);
  setPage(1);
  }}
  className="h-10 cursor-pointer rounded-lg border border-border-default bg-surface-sunken px-3 text-sm text-text-primary focus:border-primary-500 focus:outline-none"
  >
  <option value="">All statuses</option>
  <option value="confirmed">Confirmed</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
  </select>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  {Array.from({ length: 4 }).map((_, i) => (
  <Skeleton key={i} className="h-20" />
  ))}
  </div>
  ) : bookings.length === 0 ? (
  <Card>
  <CardBody>
  <EmptyState
  icon={CalendarDays}
  title="No bookings found"
  description="Once a vendor accepts your estimate and you confirm, your booking will appear here."
  action={<Link to="/search" className="text-primary-600 hover:underline dark:text-primary-400">Browse vendors →</Link>}
  />
  </CardBody>
  </Card>
  ) : (
  <div className="space-y-3">
  {bookings.map((b) => (
  <Link key={b._id} to={`/customer/bookings/${b._id}`} className="block">
  <Card hover>
  <CardBody className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-4">
  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  {b.sellerId?.coverImage ? (
  <img src={b.sellerId.coverImage} alt="" className="h-full w-full object-cover" />
  ) : (
  <CalendarDays className="h-6 w-6" />
  )}
  </div>
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">{b.sellerId?.businessName}</p>
  <p className="text-micro capitalize text-text-tertiary">
  {b.eventType} · {formatDate(b.eventDate)} · {b.guestCount} guests
  </p>
  <p className="text-micro text-text-tertiary">Booking #{String(b._id).slice(-6).toUpperCase()}</p>
  </div>
  </div>
  <div className="text-right">
  <p className="font-geist text-price font-semibold text-primary-700 dark:text-primary-400">{formatPrice(b.totalAmount)}</p>
  <p className="text-micro text-text-tertiary">deposit {formatPrice(b.depositAmount)}</p>
  </div>
  <StatusBadge status={b.status} />
  </CardBody>
  </Card>
  </Link>
  ))}
  </div>
  )}

  <Pagination page={data?.page || 1} pages={data?.pages || 1} onChange={setPage} />
  </div>
  );
}