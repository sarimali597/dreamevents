import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Heart,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import { api, apiErrorMessage, unwrap } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Stars } from '../../components/ui/Stars.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Skeleton, EmptyState, Spinner } from '../../components/ui/Feedback.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { cn, formatPrice, formatDate } from '../../lib/utils.js';
import { eventImageFromKey } from '../../lib/eventImages.js';

const PRICE_TYPE_LABEL = { fixed: '', per_person: '/ guest', per_hour: '/ hour', per_day: '/ day' };

const requestSchema = z.object({
  eventType: z.enum(['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other']),
  eventDate: z.string().min(1, 'Pick a date'),
  timeWindow: z.string().max(50).optional(),
  guestCount: z.coerce.number().min(1, 'At least 1 guest'),
  budgetMin: z.coerce.number().min(0).optional().or(z.literal('')),
  budgetMax: z.coerce.number().min(0).optional().or(z.literal('')),
  specialRequirements: z.string().max(2000).optional(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
});

const TABS = [
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Services' },
  { value: 'packages', label: 'Packages' },
  { value: 'menu', label: 'Menu' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'inspiration', label: 'Inspiration' },
  { value: 'reviews', label: 'Reviews' },
];

export default function SellerProfile() {
  const { slug } = useParams();
  const { user, isCustomer, isSeller, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('about');
  const [requestOpen, setRequestOpen] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['seller', slug],
    queryFn: async () => unwrap(await api.get(`/sellers/${slug}`)),
  });

  const sellerId = profile?._id;

  const { data: calendar, isLoading: calLoading } = useQuery({
    queryKey: ['calendar', sellerId, monthOffset],
    enabled: !!sellerId,
    queryFn: async () => {
      const d = new Date();
      const date = new Date(d.getFullYear(), d.getMonth() + monthOffset, 1);
      return unwrap(
        await api.get(`/availability/${sellerId}`, {
          params: { year: date.getFullYear(), month: date.getMonth() + 1 },
        })
      );
    },
  });

  const { data: services } = useQuery({
    queryKey: ['services', sellerId],
    enabled: !!sellerId,
    queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/services`)),
  });

  const { data: packages } = useQuery({
    queryKey: ['packages', sellerId],
    enabled: !!sellerId,
    queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/packages`)),
  });

  const { data: menu } = useQuery({
    queryKey: ['menu', sellerId],
    enabled: !!sellerId,
    queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/menu`)),
  });

  const { data: gallery } = useQuery({
    queryKey: ['gallery', sellerId],
    enabled: !!sellerId,
    queryFn: async () => unwrap(await api.get(`/sellers/${sellerId}/gallery`)),
  });

  const { data: sellerFeed } = useQuery({
    queryKey: ['seller-feed', sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const res = unwrap(await api.get('/feed', { params: { limit: 50 } }));
      return (res.posts || []).filter((p) => p.sellerId?._id === sellerId);
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', sellerId],
    enabled: !!sellerId,
    queryFn: async () => unwrap(await api.get('/reviews', { params: { sellerId } })),
  });

  const { data: favStatus } = useQuery({
    queryKey: ['fav', sellerId],
    enabled: !!sellerId && !!user,
    queryFn: async () => unwrap(await api.get('/favorites/check', { params: { sellerId } })),
  });

  const favMutation = useMutation({
    mutationFn: () => {
      if (favStatus?.isFavorite) {
        return api.delete(`/favorites/${favStatus.favorite?._id}`);
      }
      return api.post('/favorites', { type: 'seller', sellerId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fav', sellerId] });
      toast.success(favStatus?.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const flagMutation = useMutation({
    mutationFn: (id) => api.post(`/reviews/${id}/flag`, { reason: 'Reported by user' }),
    onSuccess: () => toast.success('Review reported to moderation'),
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-72" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 lg:col-span-2" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={CalendarDays}
          title="Vendor not found"
          description="This vendor may have been removed or is not yet approved."
          action={<Link to="/search"><Button variant="outline">Browse vendors</Button></Link>}
        />
      </div>
    );
  }

  const cover = profile.coverImage || profile.logo || eventImageFromKey(profile._id || profile.slug || profile.businessName);
  const daysMap = calendar?.days || {};
  const servicesList = services || [];
  const packagesList = packages || [];
  const menuGroups = menu || [];
  const galleryImages = gallery || [];
  const reviewData = reviews || { reviews: [], summary: null };
  const canBook = isCustomer;

  return (
    <div>
      {/* ── Hero ── */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary-800 to-ink-950 sm:h-80">
        {cover && <img src={cover} alt="" className="h-full w-full object-cover opacity-70" />}
        <div className="absolute inset-0 bg-gradient-subtle" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-surface-base bg-white shadow-lg dark:border-ink-800">
              {profile.logo ? (
                <img src={profile.logo} alt={profile.businessName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent-400 to-primary-600 text-3xl font-bold text-white">
                  {profile.businessName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-fraunces text-h1 text-text-primary">{profile.businessName}</h1>
                {profile.isVerified && <BadgeCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
                {profile.isFeatured && <Badge tone="gold">★ Featured</Badge>}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-body-sm text-text-secondary">
                <span className="font-geist text-price font-semibold text-primary-700 dark:text-primary-400">
                  from {formatPrice(profile.startingPrice)}
                </span>
                <Stars value={profile.rating} showValue />
                <span className="text-micro text-text-tertiary">({profile.reviewCount} reviews)</span>
                <Badge tone="primary">{profile.category}</Badge>
                {profile.subcategories?.map((s) => (
                  <Badge key={s} tone="neutral">{s}</Badge>
                ))}
              </div>
              <p className="mt-1 text-micro text-text-tertiary">
                {[profile.city, profile.area].filter(Boolean).join(', ')} · {profile.address}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-1">
            {user && !isSeller && !isAdmin && (
              <Button
                variant="outline"
                onClick={() => favMutation.mutate()}
                className={favStatus?.isFavorite ? 'border-accent-500 text-accent-600 dark:text-accent-400' : ''}
              >
                <Heart className={cn('h-4 w-4', favStatus?.isFavorite && 'fill-current')} />
                {favStatus?.isFavorite ? 'Saved' : 'Save'}
              </Button>
            )}
            {profile.whatsappNumber && (
              <a
                href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-success/50 px-4 text-body-sm font-medium text-success transition-colors hover:bg-success-light dark:hover:bg-success/10"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            <Button
              size="lg"
              disabled={!canBook}
              onClick={() => {
                if (!user) {
                  navigate(`/login?redirect=${encodeURIComponent(`/seller/${slug}`)}`);
                  return;
                }
                setRequestOpen(true);
              }}
              title={!canBook && isSeller ? 'Vendors cannot book vendors' : undefined}
            >
              <CalendarDays className="h-4 w-4" />
              {isSeller ? 'Request quote' : 'Request quote'}
            </Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="mt-8 grid gap-8 pb-16 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs tabs={TABS} active={tab} onChange={setTab} className="max-w-full" />

            <div className="mt-6">
              {tab === 'about' && (
                <div className="space-y-6">
                  <section>
                    <h2 className="font-fraunces text-h2 text-text-primary">About us</h2>
                    <p className="mt-2 whitespace-pre-line text-body text-text-secondary">{profile.description}</p>
                  </section>

                  {profile.businessHours?.length > 0 && (
                    <section>
                      <h3 className="font-geist text-h4 font-semibold text-text-primary">Business hours</h3>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {profile.businessHours.map((h) => (
                          <div key={h.day} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-body-sm dark:bg-ink-800">
                            <span className="capitalize text-text-secondary">{h.day}</span>
                            <span className={cn('font-medium', h.isOpen ? 'text-success' : 'text-error')}>
                              {h.isOpen ? `${h.open} – ${h.close}` : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {profile.policies && (profile.policies.cancellation || profile.policies.advancePayment || profile.policies.extraCharges) && (
                    <section>
                      <h3 className="font-geist text-h4 font-semibold text-text-primary">Policies</h3>
                      <div className="mt-2 space-y-3">
                        {profile.policies.cancellation && (
                          <div className="rounded-lg border border-border-default p-4">
                            <p className="text-micro font-semibold uppercase tracking-wide text-text-tertiary">Cancellation</p>
                            <p className="mt-1 text-body-sm text-text-secondary">{profile.policies.cancellation}</p>
                          </div>
                        )}
                        {profile.policies.advancePayment && (
                          <div className="rounded-lg border border-border-default p-4">
                            <p className="text-micro font-semibold uppercase tracking-wide text-text-tertiary">Advance payment</p>
                            <p className="mt-1 text-body-sm text-text-secondary">{profile.policies.advancePayment}</p>
                          </div>
                        )}
                        {profile.policies.extraCharges && (
                          <div className="rounded-lg border border-border-default p-4">
                            <p className="text-micro font-semibold uppercase tracking-wide text-text-tertiary">Extra charges</p>
                            <p className="mt-1 text-body-sm text-text-secondary">{profile.policies.extraCharges}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {(profile.socialLinks?.instagram || profile.socialLinks?.facebook || profile.socialLinks?.youtube) && (
                    <section className="flex gap-3">
                      {profile.socialLinks.instagram && (
                        <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-border-default p-2.5 text-text-secondary transition-colors hover:border-primary-400 hover:text-primary-600" aria-label="Instagram">
                          <InstagramIcon className="h-4 w-4" />
                        </a>
                      )}
                      {profile.socialLinks.facebook && (
                        <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="rounded-full border border-border-default p-2.5 text-text-secondary transition-colors hover:border-primary-400 hover:text-primary-600" aria-label="Facebook">
                          <FacebookIcon className="h-4 w-4" />
                        </a>
                      )}
                      {profile.socialLinks.youtube && (
                        <a href={profile.socialLinks.youtube} target="_blank" rel="noreferrer" className="rounded-full border border-border-default p-2.5 text-text-secondary transition-colors hover:border-primary-400 hover:text-primary-600" aria-label="YouTube">
                          <YoutubeIcon className="h-4 w-4" />
                        </a>
                      )}
                      {profile.contactPhone && (
                        <a href={`tel:${profile.contactPhone}`} className="rounded-full border border-border-default p-2.5 text-text-secondary transition-colors hover:border-primary-400 hover:text-primary-600" aria-label="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </section>
                  )}
                </div>
              )}

              {tab === 'services' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {servicesList.length === 0 && <EmptyState icon={Star} title="No services listed yet" className="sm:col-span-2" />}
                  {servicesList.map((s) => (
                    <div key={s._id} className="rounded-lg border border-border-default bg-surface-raised p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-geist text-h4 font-semibold text-text-primary">{s.name}</h4>
                        <span className="font-geist text-price font-semibold text-primary-700 dark:text-primary-400">
                          {formatPrice(s.price)}<span className="text-micro font-normal text-text-tertiary">{PRICE_TYPE_LABEL[s.priceType]}</span>
                        </span>
                      </div>
                      {s.description && <p className="mt-1.5 text-body-sm text-text-secondary">{s.description}</p>}
                      {s.inclusions?.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {s.inclusions.map((inc) => (
                            <li key={inc} className="flex items-center gap-2 text-micro text-text-secondary">
                              <Check className="h-3 w-3 text-success" /> {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'packages' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {packagesList.length === 0 && <EmptyState icon={Star} title="No packages yet" className="sm:col-span-2" />}
                  {packagesList.map((p) => (
                    <div key={p._id} className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
                      {p.image && <img src={p.image} alt="" className="h-32 w-full object-cover" />}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-geist text-h4 font-semibold text-text-primary">{p.name}</h4>
                          <Badge tone="gold">{formatPrice(p.price)}</Badge>
                        </div>
                        {p.description && <p className="mt-1.5 text-body-sm text-text-secondary">{p.description}</p>}
                        {p.inclusions?.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {p.inclusions.map((inc) => (
                              <li key={inc} className="flex items-center gap-2 text-micro text-text-secondary">
                                <Check className="h-3 w-3 text-success" /> {inc}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'menu' && (
                <div className="space-y-6">
                  {menuGroups.length === 0 && <EmptyState icon={UtensilsCrossed} title="No menu published yet" />}
                  {menuGroups.map((group) => (
                    <section key={group._id}>
                      <h4 className="flex items-center gap-2 font-fraunces text-h3 text-text-primary">
                        {group.name}
                        <span className="text-micro font-normal text-text-tertiary">({group.items?.length || 0} items)</span>
                      </h4>
                      <div className="mt-2 divide-y divide-border-subtle rounded-lg border border-border-default bg-surface-raised">
                        {(group.items || []).map((item) => (
                          <div key={item._id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                              <p className="text-body-sm font-medium text-text-primary">{item.name}</p>
                              {item.description && <p className="text-micro text-text-tertiary">{item.description}</p>}
                              <p className="text-micro text-text-tertiary">Min. {item.minQuantity} {item.minQuantity > 1 ? 'units' : 'unit'}</p>
                            </div>
                            <span className="font-geist text-body-sm font-semibold text-primary-700 dark:text-primary-400">
                              {formatPrice(item.unitPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {tab === 'gallery' && (
                <div>
                  {galleryImages.length === 0 && <EmptyState icon={Star} title="No photos yet" className="col-span-full" />}
                  <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
                    {galleryImages.map((img) => (
                      <figure
                        key={img._id}
                        className="group relative break-inside-avoid overflow-hidden rounded-xl border border-border-default"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || ''}
                          loading="lazy"
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {img.caption && (
                          <figcaption className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink-950/80 to-transparent px-3 py-2 text-micro font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'inspiration' && (
                <div>
                  {(!sellerFeed || sellerFeed.length === 0) && (
                    <EmptyState icon={Sparkles} title="No inspiration posts yet" description="This vendor hasn't shared their celebrations here yet." />
                  )}
                  <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
                    {(sellerFeed || []).map((post) => (
                      <figure
                        key={post._id}
                        className="group relative break-inside-avoid overflow-hidden rounded-xl border border-border-default"
                      >
                        <img
                          src={post.mediaUrl}
                          alt={post.caption || ''}
                          loading="lazy"
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {post.caption && (
                          <figcaption className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink-950/80 to-transparent px-3 py-2 text-micro font-medium text-white">
                            {post.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 rounded-lg bg-slate-50 p-5 dark:bg-ink-800">
                    <div className="text-center">
                      <p className="font-fraunces text-display text-text-primary">{reviewData.summary?.avgRating?.toFixed(1) || profile.rating?.toFixed(1) || '—'}</p>
                      <Stars value={reviewData.summary?.avgRating ?? profile.rating ?? 0} size="h-3.5 w-3.5" />
                      <p className="mt-1 text-micro text-text-tertiary">{reviewData.summary?.count ?? profile.reviewCount} reviews</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewData.reviews.filter((r) => Math.round(r.overallRating) === star).length;
                        const pct = reviewData.reviews.length ? Math.round((count / reviewData.reviews.length) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-micro text-text-tertiary">
                            <span className="w-6">{star} ★</span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
                              <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {reviewData.reviews.length === 0 && <EmptyState icon={Star} title="No reviews yet" description="Be the first to book and share your experience." />}
                  {reviewData.reviews.map((r) => (
                    <div key={r._id} className="rounded-lg border border-border-default bg-surface-raised p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-geist text-body-sm font-semibold text-text-primary">{r.userId?.name || 'Customer'}</span>
                            <Stars value={r.overallRating} size="h-3.5 w-3.5" />
                          </div>
                          <p className="mt-0.5 text-micro text-text-tertiary">{formatDate(r.createdAt)}</p>
                        </div>
                        {user && (
                          <button
                            onClick={() => flagMutation.mutate(r._id)}
                            className="rounded-full p-1.5 text-text-tertiary transition-colors hover:bg-error-light hover:text-error"
                            title="Report this review"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-body-sm text-text-secondary">{r.text}</p>
                      {r.sellerReply?.text && (
                        <div className="mt-3 rounded-lg bg-primary-50 p-3 dark:bg-primary-900/30">
                          <p className="text-micro font-semibold text-primary-700 dark:text-primary-400">Response from the vendor</p>
                          <p className="mt-1 text-body-sm text-text-secondary">{r.sellerReply.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar: availability ── */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-border-default bg-surface-raised p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-fraunces text-h3 text-text-primary">Availability</h3>
                <div className="flex gap-1">
                  <button onClick={() => setMonthOffset((m) => m - 1)} className="rounded-lg border border-border-default p-1.5 text-text-secondary transition-colors hover:bg-slate-50 dark:hover:bg-ink-800" aria-label="Previous month">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setMonthOffset((m) => m + 1)} className="rounded-lg border border-border-default p-1.5 text-text-secondary transition-colors hover:bg-slate-50 dark:hover:bg-ink-800" aria-label="Next month">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-1 text-micro capitalize text-text-tertiary">
                {calendar ? new Date(calendar.year, calendar.month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''}
              </p>

              {calLoading ? (
                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-md" />
                  ))}
                </div>
              ) : (
                <CalendarGrid
                  monthOffset={monthOffset}
                  daysMap={daysMap}
                  pickedDate={pickedDate}
                  onPick={(d) => {
                    setPickedDate(d);
                    if (canBook) setRequestOpen(true);
                  }}
                />
              )}

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-micro text-text-tertiary">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning" /> On hold</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-error" /> Booked</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-ink-600" /> Blocked</span>
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-surface-raised p-5 shadow-sm">
              <h3 className="font-fraunces text-h3 text-text-primary">Quick details</h3>
              <dl className="mt-3 space-y-2.5 text-body-sm">
                <div className="flex justify-between"><dt className="text-text-tertiary">Category</dt><dd className="font-medium text-text-primary">{profile.category}</dd></div>
                <div className="flex justify-between"><dt className="text-text-tertiary">Location</dt><dd className="text-right font-medium text-text-primary">{profile.city}{profile.area ? `, ${profile.area}` : ''}</dd></div>
                <div className="flex justify-between"><dt className="text-text-tertiary">Starting price</dt><dd className="font-semibold text-primary-700 dark:text-primary-400">{formatPrice(profile.startingPrice)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-tertiary">Verification</dt><dd><StatusBadge status={profile.verificationStatus} /></dd></div>
                <div className="flex justify-between"><dt className="text-text-tertiary">Member since</dt><dd className="font-medium text-text-primary">{formatDate(profile.createdAt)}</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </div>

      {requestOpen && (
        <RequestModal
          seller={profile}
          initialDate={pickedDate}
          onClose={() => setRequestOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Calendar grid ── */
function CalendarGrid({ monthOffset, daysMap, pickedDate, onPick }) {
  const grid = useMemo(() => {
    const now = new Date();
    const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(year, month, d);
      const isPast = date.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0);
      cells.push({ iso, day: d, isPast, isToday: iso === new Date().toISOString().slice(0, 10) });
    }
    return cells;
  }, [monthOffset]);

  const dayLabel = (cell) => {
    const entry = daysMap[cell.iso];
    if (!entry) return 'request';
    return entry.status;
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1.5 text-center text-micro font-medium text-text-tertiary">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {grid.map((cell, i) => {
          if (!cell) return <span key={`e${i}`} />;
          const status = dayLabel(cell);
          const isPicked = pickedDate === cell.iso;
          const isAvailable = !cell.isPast && (status === 'available' || status === 'request');
          return (
            <button
              key={cell.iso}
              disabled={!isAvailable}
              onClick={() => onPick(cell.iso)}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-md text-micro transition-all',
                isPicked && 'ring-2 ring-primary-500 ring-offset-1 ring-offset-surface-raised',
                status === 'available' && 'bg-success-light font-semibold text-success hover:bg-success/20 dark:bg-success/15',
                status === 'request' && !cell.isPast && 'bg-slate-100 font-medium text-text-secondary hover:border-primary-400 dark:bg-ink-800',
                status === 'pending' && 'bg-warning-light text-warning dark:bg-warning/15',
                status === 'booked' && 'bg-error-light text-error line-through dark:bg-error/15',
                status === 'blocked' && 'bg-slate-200 text-slate-400 line-through dark:bg-ink-700 dark:text-ink-400',
                cell.isPast && 'bg-transparent text-text-tertiary/50',
                cell.isToday && 'ring-1 ring-primary-400'
              )}
            >
              {cell.day}
              {status === 'booked' && <span className="text-[7px] leading-none">BOOKED</span>}
              {status === 'pending' && <span className="text-[7px] leading-none">HOLD</span>}
              {status === 'blocked' && <span className="text-[7px] leading-none">OFF</span>}
              {status === 'available' && <span className="text-[7px] leading-none">OPEN</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Request modal ── */
function RequestModal({ seller, initialDate, onClose }) {
  const toast = useToast();
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: { eventDate: initialDate, eventType: 'wedding', guestCount: 150 },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        sellerId: seller._id,
        eventType: values.eventType,
        eventDate: values.eventDate,
        timeWindow: values.timeWindow || undefined,
        guestCount: values.guestCount,
        specialRequirements: values.specialRequirements || undefined,
        message: values.message,
      };
      if (values.budgetMin || values.budgetMax) {
        payload.budgetRange = {};
        if (values.budgetMin) payload.budgetRange.min = Number(values.budgetMin);
        if (values.budgetMax) payload.budgetRange.max = Number(values.budgetMax);
      }
      return unwrap(await api.post('/booking-requests', payload));
    },
    onSuccess: () => {
      toast.success('Booking request sent! The vendor will get back to you.');
      qc.invalidateQueries({ queryKey: ['requests'] });
      onClose();
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal open onClose={onClose} title={`Request a quote — ${seller.businessName}`} size="lg">
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Event type" error={errors.eventType?.message} {...register('eventType')}>
            {['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'].map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </Select>
          <Input label="Event date" type="date" min={today} error={errors.eventDate?.message} {...register('eventDate')} />
          <Input label="Time window (optional)" placeholder="e.g. 6 PM – midnight" error={errors.timeWindow?.message} {...register('timeWindow')} />
          <Input label="Guest count" type="number" min="1" error={errors.guestCount?.message} {...register('guestCount')} />
          <Input label="Budget from (PKR, optional)" type="number" min="0" error={errors.budgetMin?.message} {...register('budgetMin')} />
          <Input label="Budget to (PKR, optional)" type="number" min="0" error={errors.budgetMax?.message} {...register('budgetMax')} />
        </div>
        <Textarea
          label="Special requirements (optional)"
          placeholder="Dietary needs, theme colours, extra services…"
          error={errors.specialRequirements?.message}
          {...register('specialRequirements')}
        />
        <Textarea
          label="Message to the vendor"
          placeholder="Tell them about your event and what you're looking for…"
          error={errors.message?.message}
          {...register('message')}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>
            <Send className="h-4 w-4" />
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}