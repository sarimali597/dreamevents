import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/**
 * CategoryGlassNav — premium category quick-nav for the homepage.
 * Frosted glass tiles with a brand-gradient glow that intensifies on hover,
 * a short descriptor, and a "View all vendors" CTA. Driven by brand tokens (brief §5).
 *
 * `items`: { name, icon: LucideComponent, to, tone?, blurb? }
 */
const TONE = {
  primary: 'from-primary-400 to-primary-600',
  gold: 'from-accent-300 to-accent-500',
  indigo: 'from-indigo-400 to-indigo-600',
  rose: 'from-rose-400 to-rose-600',
  teal: 'from-teal-400 to-teal-600',
  violet: 'from-violet-400 to-violet-600',
};

export function CategoryGlassNav({ items, className }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            Browse by category
          </p>
          <h2 className="mt-1 font-fraunces text-h2 text-text-primary">
            Find exactly what your event needs
          </h2>
        </div>
        <Link
          to="/search"
          className="hidden shrink-0 items-center gap-1.5 rounded-full border border-primary-200 px-4 py-2 text-body-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-ink-700 dark:text-primary-400 dark:hover:bg-ink-800 sm:inline-flex"
        >
          All vendors <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          const tone = TONE[item.tone] || TONE.primary;
          const Wrapper = item.to ? Link : 'div';
          return (
            <Wrapper
              key={item.name}
              to={item.to}
              aria-label={item.name}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border border-border-default bg-surface-raised p-4 outline-none transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
            >
              {/* glow plate */}
              <span
                className={cn(
                  'absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60',
                  tone
                )}
              />
              {/* icon chip */}
              <span
                className={cn(
                  'relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm transition-transform duration-300 group-hover:scale-110',
                  tone
                )}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </span>
              {/* label + blurb */}
              <div className="relative z-10">
                <p className="font-geist text-h4 font-semibold text-text-primary transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {item.name}
                </p>
                {item.blurb && (
                  <p className="mt-1 line-clamp-2 text-micro text-text-tertiary">{item.blurb}</p>
                )}
              </div>
              {/* hover arrow */}
              <span className="pointer-events-none absolute bottom-4 right-4 z-10 translate-x-2 text-primary-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-primary-400">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryGlassNav;
