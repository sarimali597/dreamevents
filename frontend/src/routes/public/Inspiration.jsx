import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, Share2, Sparkles } from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { EmptyState } from '../../components/ui/Feedback.jsx';
import { Spinner } from '../../components/ui/Feedback.jsx';
import { cn } from '../../lib/utils.js';

const CATS = ['All', 'Venues', 'Catering', 'Photography', 'Decoration'];

// Pinterest-style masonry via CSS columns.
export default function Inspiration() {
  const [cat, setCat] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['feed-public', cat],
    queryFn: async () => {
      const res = await api.get(`/feed?limit=60${cat !== 'All' ? `&category=${encodeURIComponent(cat)}` : ''}`);
      return unwrap(res);
    },
  });

  const posts = data?.posts || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-micro font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <Sparkles className="h-3.5 w-3.5" /> Inspiration
        </span>
        <h1 className="mt-5 font-fraunces text-h1 text-text-primary">
          Real celebrations from Sukkur's best vendors
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-body text-text-secondary">
          A feed of weddings, mehndis and events planned through DreamEvents. Save the looks you love
          and tap any post to meet the vendor behind it.
        </p>
      </div>

      {/* filter bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              'rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors',
              cat === c
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'bg-surface-sunken text-text-secondary hover:text-text-primary'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center"><Spinner variant="ring" /></div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No posts yet"
          description="Vendors haven't shared their celebrations here yet. Check back soon."
          className="mt-16"
        />
      ) : (
        <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
          {posts.map((p) => (
            <InspirationCard key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function InspirationCard({ post }) {
  const [liked, setLiked] = useState(false);
  const sellerSlug = post.sellerId?.slug || post.sellerId?.businessName;
  const sellerHref = sellerSlug ? `/seller/${encodeURIComponent(sellerSlug)}` : '/search';

  return (
    <article className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-border-default bg-surface-raised shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5">
      <Link to={sellerHref} className="block">
        <img
          src={post.mediaUrl}
          alt={post.caption || 'Event inspiration'}
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 via-ink-950/30 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <p className="line-clamp-2 text-body-sm font-medium text-white">{post.caption}</p>
        <Link
          to={sellerHref}
          className="mt-1 inline-block text-micro font-semibold text-accent-400 hover:underline"
        >
          {post.sellerId?.businessName || 'View vendor'}
        </Link>
      </div>

      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <button
          onClick={() => setLiked((v) => !v)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/60 backdrop-blur transition-colors',
            liked ? 'text-error' : 'text-white hover:text-error'
          )}
          aria-label="Save"
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur transition-colors hover:text-accent-400"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* always-visible save pill for touch devices */}
      <button
        onClick={() => setLiked((v) => !v)}
        className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ink-950/60 px-2.5 py-1 text-micro font-medium text-white backdrop-blur transition-colors hover:text-error"
      >
        <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current text-error')} />
        {post.likesCount || 0}
      </button>
    </article>
  );
}
