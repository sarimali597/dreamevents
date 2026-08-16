import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatPrice } from '../../lib/utils.js';

export default function Favorites() {
  const toast = useToast();
  const qc = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
  queryKey: ['favorites'],
  queryFn: async () => unwrap(await api.get('/favorites?type=seller')),
  });

  const removeMutation = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/favorites/${id}`)),
  onSuccess: () => {
  toast.success('Removed from favorites');
  qc.invalidateQueries({ queryKey: ['favorites'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const list = favorites || [];

  return (
  <div className="space-y-6">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Favorites</h2>
  <p className="text-body-sm text-text-tertiary">Vendors you've saved for later</p>
  </div>

  {isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 3 }).map((_, i) => (
  <Skeleton key={i} className="h-44" />
  ))}
  </div>
  ) : list.length === 0 ? (
  <EmptyState
  icon={Heart}
  title="No favorites yet"
  description="Tap the heart on any vendor profile to save them here."
  action={<Link to="/search"><Button>Browse vendors</Button></Link>}
  />
  ) : (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {list.map((f) => {
  const s = f.sellerId;
  return (
  <div key={f._id} className="overflow-hidden rounded-xl border border-border-default bg-surface-raised shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
  <Link to={`/seller/${s?.slug}`} className="block">
  <div className="relative h-32 bg-gradient-to-br from-primary-200 to-primary-600">
  {s?.coverImage && <img src={s.coverImage} alt="" className="h-full w-full object-cover" />}
  <span className="absolute left-3 top-3 rounded-full bg-primary-600/90 px-2.5 py-0.5 text-micro font-medium text-white backdrop-blur">
  {s?.category}
  </span>
  </div>
  <div className="p-4">
  <h3 className="font-geist text-h4 font-semibold text-text-primary">{s?.businessName}</h3>
  <p className="text-micro text-text-tertiary">{s?.city}{s?.area ? ` · ${s.area}` : ''}</p>
  <p className="mt-2 font-geist text-price font-semibold text-primary-700 dark:text-primary-400">
  {formatPrice(s?.startingPrice)}
  </p>
  </div>
  </Link>
  <div className="flex justify-end border-t border-border-subtle px-4 py-2.5">
  <Button
  variant="ghost"
  size="sm"
  className="text-error hover:bg-error-light hover:text-error"
  onClick={() => removeMutation.mutate(f._id)}
  >
  <Heart className="h-3.5 w-3.5 fill-current" /> Remove
  </Button>
  </div>
  </div>
  );
  })}
  </div>
  )}
  </div>
  );
}