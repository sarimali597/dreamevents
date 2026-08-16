import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { cn } from '../../lib/utils.js';

export default function AdminFeatured() {
  const toast = useToast();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');

  const { data: sellers } = useQuery({
  queryKey: ['admin-sellers-featured', query],
  queryFn: async () =>
  unwrap(await api.get('/admin/sellers', { params: { limit: 100, q: query || undefined } })),
  });
  const list = sellers?.sellers || [];

  const featuredIds = useMemo(() => list.filter((s) => s.isFeatured).map((s) => s._id), [list]);
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
  setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const save = useMutation({
  mutationFn: async () => unwrap(await api.post('/admin/homepage/featured-sellers', { sellerIds: selected })),
  onSuccess: (r) => {
  toast.success(`${r.featured} seller${r.featured === 1 ? '' : 's'} featured`);
  setSelected([]);
  qc.invalidateQueries({ queryKey: ['admin-sellers-featured'] });
  qc.invalidateQueries({ queryKey: ['admin-stats'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Featured sellers</h2>
  <p className="text-body-sm text-text-tertiary">
  Pick up to 8 sellers to showcase on the homepage. Currently featured: {featuredIds.length}.
  </p>
  </div>

  <input
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Filter by name or category…"
  className="h-10 w-full max-w-sm rounded-lg border border-border-default bg-surface-base px-3 text-sm focus:border-primary-500 focus:outline-none"
  />

  {!sellers ? (
  <Skeleton className="h-64" />
  ) : (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
  {list.map((s) => {
  const isFeatured = s.isFeatured;
  const isSelected = selected.includes(s._id);
  const willFeature = isSelected ? !isFeatured : isFeatured;
  return (
  <Card key={s._id} clickable onClick={() => toggle(s._id)}>
  <CardBody>
  <div className="flex items-center gap-3">
  <span className={cn(
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
  isFeatured ? 'bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-500' : 'bg-surface-sunken text-text-tertiary'
  )}>
  <Star className={cn('h-5 w-5', isFeatured && 'fill-current')} />
  </span>
  <div className="min-w-0">
  <p className="truncate font-geist text-body-lg font-semibold text-text-primary">{s.businessName}</p>
  <p className="text-micro text-text-tertiary">{s.category} · {s.city}</p>
  </div>
  </div>
  <div className="mt-3">
  {willFeature ? (
  <Badge tone="gold">will feature</Badge>
  ) : isFeatured ? (
  <Badge>currently featured</Badge>
  ) : (
  <Badge>not featured</Badge>
  )}
  </div>
  </CardBody>
  </Card>
  );
  })}
  </div>
  )}

  {(selected.length > 0 || featuredIds.length > 0) && (
  <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-border-default bg-surface-base/95 p-3 shadow-lg backdrop-blur">
  <p className="text-body-sm text-text-secondary">
  {selected.length > 0
  ? `${selected.length} change${selected.length === 1 ? '' : 's'} will be applied`
  : 'No changes selected'}
  </p>
  <Button variant="gold" loading={save.isPending} onClick={() => save.mutate()}>
  Save featured list
  </Button>
  </div>
  )}
  </div>
  );
}