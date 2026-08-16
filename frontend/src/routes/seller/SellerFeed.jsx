import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { api, unwrap, apiErrorMessage } from '../../lib/api.js';
import { ImageInput } from '../../components/ui/ImageInput.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { EmptyState } from '../../components/ui/Feedback.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function SellerFeed() {
  const qc = useQueryClient();
  const toast = useToast();
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['my-feed'],
    queryFn: async () => unwrap(await api.get('/feed', { params: { limit: 50 } })),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!mediaUrl) throw new Error('Add an image first');
      return unwrap(await api.post('/feed', { mediaUrl, caption, mediaType: 'image' }));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-feed'] });
      setCaption('');
      setMediaUrl('');
      toast.success('Posted to your feed');
    },
    onError: (e) => toast.error(apiErrorMessage(e, 'Could not post')),
  });

  const remove = useMutation({
    mutationFn: async (id) => unwrap(await api.delete(`/feed/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-feed'] }),
  });

  const list = posts?.posts || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-fraunces text-h2 text-text-primary">Inspiration feed</h2>
        <p className="text-body-sm text-text-tertiary">
          Share photos of events you've delivered. They appear on your storefront and the public
          inspiration wall — a Pinterest-style showcase of your best work.
        </p>
      </div>

      {/* composer */}
      <div className="card-elevated rounded-2xl p-5">
        <ImageInput value={mediaUrl} onChange={setMediaUrl} label="Event photo" />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          placeholder="Caption this celebration (e.g. 'Royal barat stage decor')"
          className="mt-3 w-full resize-none rounded-lg border border-border-default bg-surface-sunken px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={() => create.mutate()} loading={create.isLoading} disabled={!mediaUrl}>
            <ImagePlus className="h-4 w-4" /> Share post
          </Button>
        </div>
      </div>

      {/* list */}
      {isLoading ? (
        <p className="text-body-sm text-text-tertiary">Loading…</p>
      ) : list.length === 0 ? (
        <EmptyState icon={ImagePlus} title="No posts yet" description="Share your first event photo above." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <div key={p._id} className="group relative overflow-hidden rounded-xl border border-border-default">
              <img src={p.mediaUrl} alt={p.caption || ''} className="aspect-square w-full object-cover" />
              {p.caption && (
                <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink-950/80 to-transparent px-3 py-2 text-micro font-medium text-white">
                  {p.caption}
                </p>
              )}
              <button
                onClick={() => remove.mutate(p._id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:text-error"
                aria-label="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
