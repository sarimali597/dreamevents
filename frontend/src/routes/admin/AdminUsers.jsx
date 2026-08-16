import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Search, Users } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { formatDate } from '../../lib/utils.js';

const ROLE_TONES = {
  admin: 'bg-ink text-white',
  seller: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
  customer: 'bg-surface-sunken text-text-secondary',
};

export default function AdminUsers() {
  const toast = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [suspending, setSuspending] = useState(null);

  const { data, isLoading } = useQuery({
  queryKey: ['admin-users', page, role, q],
  queryFn: async () =>
  unwrap(await api.get('/admin/users', { params: { page, limit: 10, role: role || undefined, q: q || undefined } })),
  });
  const users = data?.users || [];

  const suspend = useMutation({
  mutationFn: async (id) => unwrap(await api.post(`/admin/users/${id}/suspend`)),
  onSuccess: (r) => {
  toast.success(r.message || 'User suspended');
  setSuspending(null);
  qc.invalidateQueries({ queryKey: ['admin-users'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Users</h2>
  <p className="text-body-sm text-text-tertiary">All accounts across DreamEvents.</p>
  </div>

  <div className="flex flex-wrap gap-3">
  <div className="relative flex-1 min-w-52">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
  <input
  value={q}
  onChange={(e) => { setQ(e.target.value); setPage(1); }}
  placeholder="Search by name, email or phone…"
  className="h-10 w-full rounded-lg border border-border-default bg-surface-base pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
  />
  </div>
  <select
  value={role}
  onChange={(e) => { setRole(e.target.value); setPage(1); }}
  className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="">All roles</option>
  <option value="customer">Customers</option>
  <option value="seller">Sellers</option>
  <option value="admin">Admins</option>
  </select>
  </div>

  {isLoading ? (
  <div className="space-y-3">
  <Skeleton className="h-20" />
  <Skeleton className="h-20" />
  </div>
  ) : users.length === 0 ? (
  <EmptyState icon={Users} title="No users found" description="Try a different search." />
  ) : (
  <div className="space-y-2">
  {users.map((u) => (
  <Card key={u._id}>
  <CardBody>
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div className="flex items-center gap-3">
  <img
  src={u.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(u.name || 'U')}`}
  alt={u.name}
  className="h-10 w-10 rounded-full border border-border-subtle object-cover"
  />
  <div>
  <div className="flex flex-wrap items-center gap-2">
  <p className="font-geist text-body-lg font-semibold text-text-primary">{u.name}</p>
  <span className={`rounded-full px-2 py-0.5 text-micro font-medium capitalize ${ROLE_TONES[u.role] || ROLE_TONES.customer}`}>{u.role}</span>
  {u.isDeleted && <Badge tone="error">suspended</Badge>}
  </div>
  <p className="text-body-sm text-text-tertiary">{u.email} · {u.city || '—'} · joined {formatDate(u.createdAt)}</p>
  </div>
  </div>
  {!u.isDeleted && u.role !== 'admin' && (
  <Button variant="danger" size="sm" onClick={() => setSuspending(u)}>
  <Ban className="h-4 w-4" /> Suspend
  </Button>
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

  {suspending && (
  <Modal open onClose={() => setSuspending(null)} title={`Suspend ${suspending.name}?`}>
  <p className="text-body-sm text-text-secondary">
  They will lose access to DreamEvents immediately. Their data is kept for audit purposes.
  </p>
  <div className="mt-4 flex justify-end gap-2">
  <Button variant="ghost" onClick={() => setSuspending(null)}>Cancel</Button>
  <Button variant="danger" loading={suspend.isPending} onClick={() => suspend.mutate(suspending._id)}>
  Suspend account
  </Button>
  </div>
  </Modal>
  )}
  </div>
  );
}