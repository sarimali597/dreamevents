import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, MapPin } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { Stars } from '../ui/Stars.jsx';
import { Card, CardBody } from '../ui/Card.jsx';
import { cn, formatPrice, slugify } from '../../lib/utils.js';
import { eventImageFromKey } from '../../lib/eventImages.js';

export function SellerCard({ seller, className }) {
  const cover = seller.coverImageUrl || seller.logoUrl || eventImageFromKey(seller._id || seller.slug || seller.businessName);
  const slug = seller.slug || slugify(seller.businessName);
  return (
  <Link to={`/seller/${slug}`} className={cn('group block h-full', className)}>
  <Card hover className="relative h-full overflow-hidden">
  {/* gradient hairline ring on hover (premium "framed" feel) */}
  <span className="ring-gradient pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

  <div className="relative h-44 overflow-hidden bg-ink-100 dark:bg-ink-800">
  {cover ? (
  <img
  src={cover}
  alt={seller.businessName}
  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
  loading="lazy"
  />
  ) : (
  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-200 to-primary-600 text-3xl font-bold text-white dark:from-ink-700 dark:to-ink-900">
  {seller.businessName?.charAt(0) || '?'}
  </div>
  )}

  {seller.isFeatured && (
  <Badge tone="gold" className="absolute left-3 top-3 shadow-sm">
  Featured
  </Badge>
  )}

  {/* floating "view" affordance */}
  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-primary-700 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100 dark:bg-ink-900/80 dark:text-primary-300">
  <ArrowUpRight className="h-4 w-4" />
  </span>

  <div className="absolute inset-x-0 bottom-0 bg-gradient-subtle px-3 pb-2 pt-10">
  <div className="flex items-center gap-1.5 text-white">
  <span className="font-geist text-sm font-semibold drop-shadow">{seller.businessName}</span>
  {seller.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent-400" />}
  </div>
  <p className="flex items-center gap-1 text-micro text-slate-200">
  <MapPin className="h-3 w-3" />
  {[seller.city, seller.area].filter(Boolean).join(', ')}
  </p>
  </div>
  </div>

  <CardBody className="p-4">
  <div className="flex items-center justify-between gap-2">
  <Badge tone="primary" className="max-w-[60%] truncate">
  {seller.category}
  </Badge>
  <Stars value={seller.rating} showValue size="h-3.5 w-3.5" />
  </div>
  <p className="mt-2.5 line-clamp-2 text-body-sm text-text-secondary">
  {seller.tagline || seller.description}
  </p>
  <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
  <span className="text-micro text-text-tertiary">Starting from</span>
  <span className="font-geist text-price font-semibold text-primary-700 dark:text-primary-400">
  {formatPrice(seller.startingPrice)}
  </span>
  </div>
  </CardBody>
  </Card>
  </Link>
  );
}
