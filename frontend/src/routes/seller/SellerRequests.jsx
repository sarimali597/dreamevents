import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Inbox, MessageSquarePlus, XCircle } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Textarea } from '../../components/ui/Field.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../lib/utils.js';

export default function SellerRequests() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
  queryKey: ['seller-requests', page],
  queryFn: async () => unwrap(await api.get('/booking-requests', { params: { page, limit: 8 } })),
  });
  const requests = data?.requests || data?.data || [];

  const respond = useMutation({
  mutationFn: async ({ id, action }) =>
  unwrap(await api.put(`/booking-requests/${id}/status`, { action, message: message || undefined })),
  onSuccess: (r) => {
  toast.success(r.message || 'Request updated');
  setMessage('');
  setOpenId(null);
  qc.invalidateQueries({ queryKey: ['seller-requests'] });
  qc.invalidateQueries({ queryKey: ['seller-dashboard'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Booking requests</h2>
  <p className="text-body-sm text-text-tertiary">
  Reply, send an estimate, or decline — customers see your answer instantly.
  </p>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-28" />
  <Skeleton className="h-28" />
  <Skeleton className="h-28" />
  </div>
  ) : requests.length === 0 ? (
  <EmptyState
  icon={Inbox}
  title="No booking requests"
  description="When a couple sends you a request, it will appear here."
  />
  ) : (
  <div className="space-y-3">
  {requests.map((r) => (
  <Card key={r._id}>
  <CardBody>
  <div className="flex flex-wrap items-start justify-between gap-3">
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <h3 className="font-geist text-body-lg font-semibold capitalize text-text-primary">
  {r.eventType} · {r.eventId?.name || 'Custom event'}
  </h3>
  <StatusBadge status={r.status} />
  {r.depositAmount > 0 && <Badge tone="gold">{r.depositAmount.toLocaleString('en-PK')} PKR deposit</Badge>}
  </div>
  <p className="mt-1 text-body-sm text-text-secondary">
  {formatDate(r.eventDate)} · {r.guestCount} guests
  {r.timeWindow ? ` · ${r.timeWindow}` : ''}
  {r.budgetRange?.max ? ` · budget up to ${r.budgetRange.max.toLocaleString('en-PK')} PKR` : ''}
  </p>
  {r.specialRequirements && (
  <p className="mt-2 rounded-lg bg-surface-sunken p-3 text-body-sm italic text-text-secondary">
  “{r.specialRequirements}”
  </p>
  )}
  {r.message && (
  <p className="mt-1 text-body-sm text-text-tertiary">{r.message}</p>
  )}
  </div>
  <div className="flex shrink-0 gap-2">
  <Link to={`/seller/estimates?request=${r._id}`}>
  <Button variant="gold" size="sm"><FileText className="h-4 w-4" /> Estimate</Button>
  </Link>
  </div>
  </div>

  {r.status === 'pending' && (
  <div className="mt-4 border-t border-border-subtle pt-4">
  <button
  type="button"
  onClick={() => setOpenId(openId === r._id ? null : r._id)}
  className="inline-flex items-center gap-1.5 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
  >
  <MessageSquarePlus className="h-4 w-4" /> {openId === r._id ? 'Hide' : 'Reply or decline'}
  </button>

  {openId === r._id && (
  <div className="mt-3 space-y-3">
  <Textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Write a message to the customer…"
  rows={3}
  />
  <div className="flex gap-2">
  <Button
  size="sm"
  loading={respond.isPending}
  onClick={() => respond.mutate({ id: r._id, action: 'reply' })}
  >
  Send reply
  </Button>
  <Button
  variant="danger"
  size="sm"
  loading={respond.isPending}
  onClick={() => respond.mutate({ id: r._id, action: 'reject' })}
  >
  <XCircle className="h-4 w-4" /> Decline request
  </Button>
  </div>
  </div>
  )}
  </div>
  )}
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