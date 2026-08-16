import { useEffect, useMemo, useState } from 'react';
import { cn } from '../../lib/utils.js';

/**
 * HeroCarousel — a slow, auto-advancing Ken Burns image carousel used as the
 * *background* of the homepage hero (UI/UX Brief §9.1: the hero is the visual
 * anchor; imagery carries the category, §1.2 "visual, not textual").
 *
 * Design notes:
 *  - Images cross-fade (never slide) so the centred hero copy stays readable.
 *  - A `gradient-trust`-style scrim + bottom `gradient-subtle` keeps white text
 *  at AA contrast over any photo (Brief §2.8, §11).
 *  - Respects `prefers-reduced-motion`: no auto-advance, no Ken Burns zoom.
 *  - Dots are real buttons with aria labels for keyboard/AT users (Brief §11).
 */

const DEFAULT_SLIDES = [
  { src: '/home/slide-1.jpg', alt: 'An elegant banquet hall set up for a wedding reception', label: 'Venues & Halls' },
  { src: '/home/slide-2.jpg', alt: 'A catered buffet spread of fresh food at an event', label: 'Catering & Food' },
  { src: '/home/slide-3.jpg', alt: 'A camera on a tripod capturing a candlelit outdoor dinner', label: 'Photography' },
  { src: '/home/slide-4.jpg', alt: 'Guests raising their glasses in a celebratory toast', label: 'Celebrations' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => setReduced(mq.matches);
  update();
  mq.addEventListener('change', update);
  return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function HeroCarousel({
  slides = DEFAULT_SLIDES,
  interval = 6000,
  className,
  children,
  showDots = true,
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const count = slides.length;

  // Auto-advance. Skipped entirely for reduced-motion users or while hovered.
  useEffect(() => {
  if (reduced || paused || count <= 1) return undefined;
  const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
  return () => clearInterval(id);
  }, [reduced, paused, count, interval]);

  // Preload the next image so the cross-fade never flashes an empty frame.
  useEffect(() => {
  if (count <= 1) return;
  const next = new Image();
  next.src = slides[(index + 1) % count].src;
  }, [index, count, slides]);

  const active = slides[index];

  const dots = useMemo(
  () =>
  slides.map((s, i) => (
  <button
  key={s.src}
  type="button"
  onClick={() => setIndex(i)}
  aria-label={`Show slide ${i + 1} of ${count}: ${s.label}`}
  aria-current={i === index}
  className={cn(
  'h-2 rounded-full transition-all duration-300',
  i === index
  ? 'w-8 bg-accent-500'
  : 'w-2 bg-white/50 hover:bg-white/80'
  )}
  />
  )),
  [slides, index, count]
  );

  return (
  <div
  className={cn('relative isolate overflow-hidden bg-ink-950', className)}
  onMouseEnter={() => setPaused(true)}
  onMouseLeave={() => setPaused(false)}
  >
  {/* ── Image layer: all slides stacked, only the active one at full opacity ── */}
  {slides.map((s, i) => (
  <div
  key={s.src}
  aria-hidden={i !== index}
  className={cn(
  'absolute inset-0 transition-opacity duration-1000 ease-in-out',
  i === index ? 'opacity-100' : 'opacity-0'
  )}
  >
  <img
  src={s.src}
  alt={i === index ? s.alt : ''}
  loading={i === 0 ? 'eager' : 'lazy'}
  decoding="async"
  className={cn(
  'h-full w-full object-cover',
  // Slow Ken Burns drift on the active slide only.
  !reduced && i === index && 'animate-hero-pan'
  )}
  />
  </div>
  ))}

  {/* ── Readability scrim (Brief §2.8 gradient-trust / gradient-subtle) ── */}
  <div className="absolute inset-0 bg-ink-950/55" />
  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-ink-950/40 to-ink-950/80" />
  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-subtle" />

  {/* ── Hero content ── */}
  {children && <div className="relative z-10 h-full w-full">{children}</div>}

  {/* ── Slide indicators ── */}
  {showDots && count > 1 && (
  <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
  {dots}
  <span className="sr-only" aria-live="polite">
  {active.label}
  </span>
  </div>
  )}
  </div>
  );
}

export default HeroCarousel;
