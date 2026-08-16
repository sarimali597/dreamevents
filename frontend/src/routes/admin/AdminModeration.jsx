import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Flag, Star, Trash2, XCircle } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../lib/utils.js';

export default function AdminModeration() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState('');

  const { data, isLoading } = useQuery({
  queryKey: ['admin-reports', page, status],
  queryFn: async () =>
  unwrap(await api.get('/admin/moderation', { params: { page, limit: 10, status: status || undefined } })),
  });
  const reports = data?.reports || [];

  const act = useMutation({
  mutationFn: async ({ id, type }) =>
  unwrap(await api.post(`/admin/reports/${id}/${type}`, resolution ? { resolution } : {})),
  onSuccess: (r) => {
  toast.success(r.message || 'Report updated');
  setSelected(null);
  setResolution('');
  qc.invalidateQueries({ queryKey: ['admin-reports'] });
  qc.invalidateQueries({ queryKey: ['admin-stats'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const removeReview = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/admin/reviews/${id}`)),
  onSuccess: () => {
  toast.success('Review removed');
  setSelected(null);
  qc.invalidateQueries({ queryKey: ['admin-reports'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Moderation</h2>
  <p className="text-body-sm text-text-tertiary">Review reports and take action.</p>
  </div>

  <select
  value={status}
  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
  className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="">All statuses</option>
  <option value="open">Open</option>
  <option value="under_review">Under review</option>
  <option value="resolved">Resolved</option>
  <option value="dismissed">Dismissed</option>
  </select>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-24" />
  <Skeleton className="h-24" />
  </div>
  ) : reports.length === 0 ? (
  <EmptyState icon={Flag} title="All clear" description="No reports match this filter." />
  ) : (
  <div className="space-y-3">
  {reports.map((r) => (
  <Card key={r._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <p className="font-geist text-body-lg font-semibold capitalize text-text-primary">
  {r.targetType} report
  </p>
  <StatusBadge status={r.status} />
  </div>
  <p className="mt-1 line-clamp-2 text-body-sm text-text-secondary">{r.reason}</p>
  <p className="mt-1 text-micro text-text-tertiary">
  Reported by {r.reporterId?.name || '—'} · {formatDate(r.createdAt)}
  {r.targetId?.title ? ` · target: ${r.targetId.title}` : ''}
  </p>
  </div>
  {r.status === 'open' || r.status === 'under_review' ? (
  <div className="flex shrink-0 gap-2">
  {r.targetType === 'review' && (
  <Button variant="danger" size="sm" onClick={() => removeReview.mutate(r.targetId)}>
  <Trash2 className="h-4 w-4" /> Remove review
  </Button>
  )}
  <Button variant="gold" size="sm" onClick={() => setSelected(r)}>
  <Star className="h-4 w-4" /> Resolve
  </Button>
  <Button variant="outline" size="sm" onClick={() => act.mutate({ id: r._id, type: 'dismiss' })}>
  <XCircle className="h-4 w-4" /> Dismiss
  </Button>
  </div>
  ) : (
  <p className="text-micro text-text-tertiary">
  {r.status === 'resolved' ? `Resolved: ${r.resolution || ''}` : 'Dismissed'}
  </p>
  )}
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
  <Modal open onClose={() => setSelected(null)} title="Resolve report">
  <p className="text-body-sm text-text-secondary">{selected.reason}</p>
  <div className="mt-4">
  <Textarea
  label="Resolution note (optional)"
  rows={3}
  value={resolution}
  onChange={(e) => setResolution(e.target.value)}
  placeholder="What action did you take?"
  />
  </div>
  <div className="mt-4 flex justify-end gap-2">
  <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
  <Button variant="gold" loading={act.isPending} onClick={() => act.mutate({ id: selected._id, type: 'resolve' })}>
  <CheckCircle2 className="h-4 w-4" /> Mark resolved
  </Button>
  </div>
  </Modal>
  )}
  </div>
  );
}