import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../lib/utils.js';

export default function MyRequests() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
  queryKey: ['requests', { page, status }],
  queryFn: async () =>
  unwrap(await api.get('/booking-requests', { params: { page, limit: 10, status: status || undefined } })),
  });

  const requests = data?.requests || [];

  return (
  <div className="space-y-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Requests & quotes</h2>
  <p className="text-body-sm text-text-tertiary">Every quote request you've sent to vendors</p>
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
  <option value="pending">Pending</option>
  <option value="seller_replied">Seller replied</option>
  <option value="estimate_sent">Estimate sent</option>
  <option value="negotiating">Negotiating</option>
  <option value="accepted">Accepted</option>
  <option value="rejected">Rejected</option>
  <option value="cancelled">Cancelled</option>
  </select>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  {Array.from({ length: 4 }).map((_, i) => (
  <Skeleton key={i} className="h-20" />
  ))}
  </div>
  ) : requests.length === 0 ? (
  <Card>
  <CardBody>
  <EmptyState
  icon={ClipboardList}
  title="No requests yet"
  description="Visit a vendor's profile and send a booking request to get started."
  action={<Link to="/search" className="text-primary-600 hover:underline dark:text-primary-400">Browse vendors →</Link>}
  />
  </CardBody>
  </Card>
  ) : (
  <div className="space-y-3">
  {requests.map((r) => (
  <Link key={r._id} to={`/customer/requests/${r._id}`} className="block">
  <Card hover>
  <CardBody className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-4">
  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  {r.sellerId?.coverImage ? (
  <img src={r.sellerId.coverImage} alt="" className="h-full w-full object-cover" />
  ) : (
  r.sellerId?.businessName?.charAt(0)
  )}
  </div>
  <div>
  <p className="font-geist text-body-sm font-semibold text-text-primary">{r.sellerId?.businessName}</p>
  <p className="text-micro capitalize text-text-tertiary">
  {r.eventType} · {formatDate(r.eventDate)} · {r.guestCount} guests
  </p>
  {r.depositAmount > 0 && (
  <p className="text-micro text-text-tertiary">Deposit: {r.depositAmount.toLocaleString('en-PK')} PKR</p>
  )}
  </div>
  </div>
  <StatusBadge status={r.status} />
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