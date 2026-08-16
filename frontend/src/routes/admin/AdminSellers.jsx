import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, Eye, Search, ShoppingBag, XCircle } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Input, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../lib/utils.js';

export default function AdminSellers() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['admin-sellers', page, status, q],
  queryFn: async () =>
  unwrap(await api.get('/admin/sellers', { params: { page, limit: 10, status: status || undefined, q: q || undefined } })),
  });
  const sellers = data?.sellers || [];

  const action = useMutation({
  mutationFn: async ({ id, type, reason }) =>
  unwrap(await api.post(`/admin/sellers/${id}/${type}`, reason ? { reason } : {})),
  onSuccess: (r, v) => {
  toast.success(r.message || 'Done');
  qc.invalidateQueries({ queryKey: ['admin-sellers'] });
  qc.invalidateQueries({ queryKey: ['admin-stats'] });
  setSelected(null);
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Sellers</h2>
  <p className="text-body-sm text-text-tertiary">Review, approve and manage storefronts.</p>
  </div>
  </div>

  <div className="flex flex-wrap gap-3">
  <div className="relative flex-1 min-w-52">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
  <input
  value={q}
  onChange={(e) => { setQ(e.target.value); setPage(1); }}
  placeholder="Search by name, slug or category…"
  className="h-10 w-full rounded-lg border border-border-default bg-surface-base pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  </div>
  <select
  value={status}
  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
  className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="">All statuses</option>
  <option value="pending">Pending</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="suspended">Suspended</option>
  </select>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : sellers.length === 0 ? (
  <EmptyState icon={ShoppingBag} title="No sellers found" description="Try a different search or filter." />
  ) : (
  <div className="space-y-3">
  {sellers.map((s) => (
  <Card key={s._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
  {s.logo ? (
  <img src={s.logo} alt={s.businessName} className="h-11 w-11 rounded-lg object-cover" />
  ) : (
  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-100 font-geist text-body-lg font-bold text-primary-600 dark:bg-primary-900 dark:text-primary-400">
  {s.businessName?.charAt(0)}
  </span>
  )}
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <p className="font-geist text-body-lg font-semibold text-text-primary">{s.businessName}</p>
  <StatusBadge status={s.status} />
  {s.isFeatured && <Badge tone="gold">featured</Badge>}
  </div>
  <p className="text-body-sm text-text-tertiary">
  {s.category} · {s.city} · joined {formatDate(s.createdAt)}
  {s.rejectionReason && <span className="text-error"> · {s.rejectionReason}</span>}
  </p>
  </div>
  </div>
  <div className="flex shrink-0 gap-2">
  <Button variant="outline" size="sm" onClick={() => setSelected(s)}><Eye className="h-4 w-4" /> View</Button>
  {s.status === 'pending' && (
  <>
  <Button variant="gold" size="sm" onClick={() => action.mutate({ id: s._id, type: 'approve' })}>
  <CheckCircle2 className="h-4 w-4" /> Approve
  </Button>
  <Button variant="danger" size="sm" onClick={() => setSelected(s)}>
  <XCircle className="h-4 w-4" /> Reject
  </Button>
  </>
  )}
  {s.status === 'approved' && (
  <Button variant="danger" size="sm" onClick={() => setSelected(s)}>
  <Ban className="h-4 w-4" /> Suspend
  </Button>
  )}
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

  {selected && (
  <SellerModal
  seller={selected}
  onClose={() => setSelected(null)}
  onApprove={() => action.mutate({ id: selected._id, type: 'approve' })}
  onReject={(reason) => action.mutate({ id: selected._id, type: 'reject', reason })}
  onSuspend={(reason) => action.mutate({ id: selected._id, type: 'suspend', reason })}
  loading={action.isPending}
  />
  )}
  </div>
  );
}

function SellerModal({ seller: s, onClose, onApprove, onReject, onSuspend, loading }) {
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState(s.status === 'approved' ? 'suspend' : s.status === 'rejected' ? 'approve' : 'reject');

  const submit = () => {
  if (mode === 'approve') onApprove();
  if (mode === 'reject') onReject(reason || 'Does not meet DreamEvents standards');
  if (mode === 'suspend') onSuspend(reason || undefined);
  };

  return (
  <Modal open onClose={onClose} title={s.businessName}>
  <div className="space-y-4">
  <div className="flex items-center gap-3">
  {s.coverImage && <img src={s.coverImage} alt="" className="h-24 w-36 rounded-lg object-cover" />}
  <div>
  <StatusBadge status={s.status} />
  <p className="mt-1 text-body-sm text-text-secondary">{s.category} · {s.area}, {s.city}</p>
  <p className="text-body-sm text-text-secondary">{s.contactPhone}{s.contactEmail ? ` · ${s.contactEmail}` : ''}</p>
  </div>
  </div>
  <p className="line-clamp-4 text-body-sm text-text-secondary">{s.description || 'No description provided.'}</p>
  <p className="text-micro text-text-tertiary">
  Starting price {s.startingPrice.toLocaleString('en-PK')} PKR · onboarding step {s.onboardingStep}/6
  {s.onboardingCompleted ? ' · onboarding complete' : ''}
  </p>

  <div>
  <div className="flex gap-1 rounded-lg bg-surface-sunken p-1">
  {(s.status === 'approved' || s.status === 'suspended') && (
  <button type="button" onClick={() => setMode('suspend')} className={`flex-1 rounded-md px-3 py-1.5 text-body-sm font-medium ${mode === 'suspend' ? 'bg-error text-white' : 'text-text-secondary'}`}>Suspend</button>
  )}
  <button type="button" onClick={() => setMode('approve')} className={`flex-1 rounded-md px-3 py-1.5 text-body-sm font-medium ${mode === 'approve' ? 'bg-primary-600 text-white' : 'text-text-secondary'}`}>Approve</button>
  <button type="button" onClick={() => setMode('reject')} className={`flex-1 rounded-md px-3 py-1.5 text-body-sm font-medium ${mode === 'reject' ? 'bg-error text-white' : 'text-text-secondary'}`}>Reject</button>
  </div>
  </div>

  {mode !== 'approve' && (
  <Textarea
  label={mode === 'reject' ? 'Rejection reason (shown to seller)' : 'Reason (optional)'}
  rows={3}
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  placeholder="e.g. Please add real photos and complete your menu…"
  />
  )}

  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button
  variant={mode === 'approve' ? 'gold' : 'danger'}
  loading={loading}
  disabled={mode === 'reject' && reason.trim().length < 3}
  onClick={submit}
  >
  {mode === 'approve' ? 'Approve seller' : mode === 'reject' ? 'Reject seller' : 'Suspend seller'}
  </Button>
  </div>
  </div>
  </Modal>
  );
}