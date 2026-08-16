import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { EmptyState, Skeleton } from '../../components/ui/Feedback.jsx';
import { ImageInput } from '../../components/ui/ImageInput.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { cn } from '../../lib/utils.js';

export default function SellerGallery() {
  const toast = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: me } = useQuery({
  queryKey: ['seller-me'],
  queryFn: async () => unwrap(await api.get('/sellers/dashboard')),
  });
  const sellerId = me?.profile?._id;

  const { data, isLoading } = useQuery({
  queryKey: ['gallery', sellerId],
  queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/gallery`)),
  enabled: !!sellerId,
  });
  const images = data?.gallery || data?.images || data?.data || [];

  const remove = useMutation({
  mutationFn: async (id) => unwrap(await api.delete(`/services/gallery-images/${id}`)),
  onSuccess: () => {
  toast.success('Photo removed');
  qc.invalidateQueries({ queryKey: ['gallery'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3">
  <div>
  <h2 className="font-fraunces text-h2 text-text-primary">Gallery</h2>
  <p className="text-body-sm text-text-tertiary">Show couples your best work.</p>
  </div>
  <Button onClick={() => setAdding(true)}><ImagePlus className="h-4 w-4" /> Add photos</Button>
  </div>

  {isLoading ? (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  <Skeleton className="aspect-square" />
  <Skeleton className="aspect-square" />
  <Skeleton className="aspect-square" />
  <Skeleton className="aspect-square" />
  </div>
  ) : images.length === 0 ? (
  <EmptyState icon={ImagePlus} title="Gallery is empty" description="Add photos to make your storefront shine." />
  ) : (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  {images.map((img) => (
  <div key={img._id} className="group relative overflow-hidden rounded-xl border border-border-subtle">
  <img src={img.url} alt={img.caption || 'Gallery photo'} className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
  <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/70 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
  <div className="flex justify-end">
  <button
  type="button"
  onClick={() => remove.mutate(img._id)}
  className="rounded-full bg-error p-2 text-white shadow-lg hover:bg-error/90"
  aria-label="Remove photo"
  >
  <Trash2 className="h-4 w-4" />
  </button>
  </div>
  {img.isCover && (
  <span className="flex w-fit items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 text-micro font-semibold text-ink">
  <Star className="h-3 w-3" /> Cover
  </span>
  )}
  {img.caption && <p className="text-micro text-white/90">{img.caption}</p>}
  </div>
  </div>
  ))}
  </div>
  )}

  {adding && <AddPhotoModal onClose={() => setAdding(false)} />}
  </div>
  );
}

function AddPhotoModal({ onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('other');
  const [makeCover, setMakeCover] = useState(false);

  const save = useMutation({
  mutationFn: async () =>
  unwrap(await api.post('/services/gallery-images', {
  url,
  thumbnailUrl: url,
  category,
  caption: caption || undefined,
  isCover: makeCover,
  })),
  onSuccess: () => {
  toast.success('Photo added to gallery');
  onClose();
  qc.invalidateQueries({ queryKey: ['gallery'] });
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
  });

  return (
  <Modal open onClose={onClose} title="Add photo">
  <div className="space-y-4">
  <ImageInput label="Photo" value={url} onChange={setUrl} />
  <Input label="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Mehndi night setup" />
  <div className="flex items-center justify-between">
  <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="h-10 rounded-lg border border-border-default bg-surface-sunken px-3 text-sm focus:border-primary-500 focus:outline-none"
  >
  <option value="venue">Venue</option>
  <option value="food">Food</option>
  <option value="decoration">Decoration</option>
  <option value="photos">Photos</option>
  <option value="other">Other</option>
  </select>
  <label className={cn('flex cursor-pointer items-center gap-2 text-body-sm text-text-secondary')}>
  <input type="checkbox" checked={makeCover} onChange={(e) => setMakeCover(e.target.checked)} className="h-4 w-4 accent-primary-600" />
  Set as cover photo
  </label>
  </div>
  <div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button loading={save.isPending} disabled={!url} onClick={() => save.mutate()}>Add photo</Button>
  </div>
  </div>
  </Modal>
  );
}