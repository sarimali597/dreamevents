import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarHeart,
  Calculator,
  Handshake,
  PartyPopper,
  Search,
  Sparkles,
  Compass,
  ShieldCheck,
  Heart,
  MapPin,
} from 'lucide-react';
import { api, unwrap } from '../../lib/api.js';
import { HeroCarousel } from '../../components/effects/HeroCarousel.jsx';
import { TypeText } from '../../components/effects/TypeText.jsx';
import { FadeIn, FadeInStagger, StaggerItem } from '../../components/effects/FadeIn.jsx';
import { SellerCard } from '../../components/ui/SellerCard.jsx';
import { StepList } from '../../components/effects/Stepper.jsx';
import { Skeleton } from '../../components/ui/Feedback.jsx';
import { MarqueeBand } from '../../components/ui/MarqueeBand.jsx';
import { SpotlightGrid } from '../../components/enhanced/SpotlightGrid.jsx';
import AccordionGallery from '../../components/enhanced/AccordionGallery.jsx';
import { MapEmbed } from '../../components/ui/MapEmbed.jsx';

/** Local fallback photos for category tiles (the API `image` can be empty for
 *  admin-created categories, and a broken <img> is worse than a themed photo). */
const CATEGORY_FALLBACK = ['/home/slide-1.jpg', '/home/slide-2.jpg', '/home/slide-3.jpg', '/home/slide-4.jpg'];

const EVENT_TYPES = ['wedding', 'mehndi', 'engagement', 'birthday', 'corporate', 'family', 'other'];

const HOW_IT_WORKS = [
  {
    icon: <Search className="h-4 w-4" />,
    title: 'Browse & discover',
    description: 'Explore Pakistan’s finest wedding vendors across venues, catering, photography, decor and more.',
  },
  {
    icon: <Handshake className="h-4 w-4" />,
    title: 'Send a request',
    description: 'Pick a date, share your guest count and requirements — the vendor holds that date for you.',
  },
  {
    icon: <Calculator className="h-4 w-4" />,
    title: 'Get your estimate',
    description: 'Vendors respond with a transparent, itemised estimate. Negotiate politely right in the chat.',
  },
  {
    icon: <PartyPopper className="h-4 w-4" />,
    title: 'Confirm & celebrate',
    description: 'Accept the estimate, pay the deposit and DreamEvents keeps the plan on track until the big day.',
  },
];

const ABOUT_PILLARS = [
  { icon: ShieldCheck, title: 'Trust first', text: 'Verified vendors, transparent pricing and a ledger-backed deposit — no surprise charges.' },
  { icon: Compass, title: 'Discovery made easy', text: 'Browse venues, caterers, photographers and decorators by category and budget in one place.' },
  { icon: Heart, title: 'Built for Sukkur', text: 'A marketplace made for our city first — with the people and venues we know and love.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrap(await api.get('/search/categories')),
  });

  const { data: featured, isLoading: featLoading } = useQuery({
    queryKey: ['sellers', 'featured'],
    queryFn: async () => unwrap(await api.get('/sellers', { params: { limit: 8 } })),
  });

  const { data: feedPreview } = useQuery({
    queryKey: ['feed', 'home-preview'],
    queryFn: async () => {
      const res = unwrap(await api.get('/feed', { params: { limit: 8 } }));
      return res.posts || [];
    },
  });

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    navigate(`/search?${params.toString()}`);
  };

  const sellers = featured?.sellers || [];
  const cats = categories || [];

  return (
    <div>
      {/* ── Hero ── */}
      <section id="top" className="relative overflow-hidden">
        <HeroCarousel className="min-h-[88vh]">
          <SpotlightGrid className="z-0 opacity-40" />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-20 text-center sm:pt-28">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-micro font-medium uppercase tracking-widest text-accent-400">
                <Sparkles className="h-3.5 w-3.5" />
                Sukkur's trusted wedding marketplace
              </span>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="mt-6 font-fraunces text-display font-medium leading-tight text-white">
                Find the perfect vendor
                <br />
                for your <TypeText texts={['perfect day', 'mehndi night', 'big celebration']} className="text-accent-400" />
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-5 max-w-xl text-body text-slate-300">
                DreamEvents connects you with vetted venues, caterers, photographers, decor and
                entertainment — compare quotes, negotiate estimates and book with confidence.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-9 w-full max-w-2xl">
              <form
                onSubmit={submit}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-md sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search venues, caterers, photographers…"
                    className="h-12 w-full rounded-xl border-0 bg-transparent pl-10 pr-3 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-12 cursor-pointer rounded-xl border border-white/10 bg-ink-900/60 px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                >
                  <option value="">All categories</option>
                  {cats.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-600"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </FadeIn>

            <FadeIn delay={0.4} className="mt-8">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-body-sm text-slate-300">
                <span><strong className="font-geist text-white">500+</strong> verified vendors</span>
                <span className="hidden h-4 w-px bg-white/20 sm:block" />
                <span><strong className="font-geist text-white">12k+</strong> celebrations planned</span>
                <span className="hidden h-4 w-px bg-white/20 sm:block" />
                <span><strong className="font-geist text-white">4.8 ★</strong> average rating</span>
              </div>
            </FadeIn>
          </div>
        </HeroCarousel>
      </section>

      {/* ── Browse by category (premium image tiles, single section) ── */}
      <section id="categories" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <FadeIn className="flex items-end justify-between gap-4">
          <div>
            <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Browse by category
            </p>
            <h2 className="mt-1 font-fraunces text-h2 text-text-primary">Every vendor you need</h2>
          </div>
          <Link to="/search" className="hidden items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400 sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        {catLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : (
          <FadeInStagger className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cats.slice(0, 10).map((c, i) => (
              <StaggerItem key={c._id}>
                <Link
                  to={`/search?category=${encodeURIComponent(c.name)}`}
                  className="group relative block h-44 overflow-hidden rounded-2xl shadow-sm ring-1 ring-border-default transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <img
                    src={c.image || c.imageUrl || CATEGORY_FALLBACK[i % CATEGORY_FALLBACK.length]}
                    alt={c.name}
                    onError={(e) => {
                      e.currentTarget.src = CATEGORY_FALLBACK[i % CATEGORY_FALLBACK.length];
                    }}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/25 to-transparent transition-opacity duration-300 group-hover:from-primary-900/80" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <h3 className="font-geist text-body font-semibold text-white drop-shadow">{c.name}</h3>
                    <p className="text-micro text-slate-200">{c.subcategories?.length || 0} specialties</p>
                  </div>
                  <span className="absolute right-3 top-3 translate-y-1 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </FadeInStagger>
        )}
      </section>

      {/* ── Trusted-by marquee ── */}
      <section className="mt-14 border-y border-border-subtle bg-surface-sunken py-6">
        <p className="mb-4 text-center text-micro font-semibold uppercase tracking-widest text-text-tertiary">
          Loved by couples &amp; planners across Sukkur
        </p>
        <MarqueeBand speed={32}>
          {['The Grand Marquee', 'Shaadi Catering Co.', 'Lens & Light Studio', 'Royal Venues', 'Mehndi Magic', 'Flavor Nest', 'Dream Decor PK', 'Sound & Stage Pro', 'Cake Couture', 'Royal Rides'].map((n) => (
            <span key={n} className="whitespace-nowrap font-fraunces text-lg font-medium text-text-secondary">
              {n}
            </span>
          ))}
        </MarqueeBand>
      </section>

      {/* ── About (on homepage, scrollable) ── */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5" /> About DreamEvents
          </p>
          <h2 className="mt-2 font-fraunces text-h1 text-text-primary">
            We make event planning feel like celebration, not chaos.
          </h2>
          <p className="mt-4 text-body text-text-secondary">
            DreamEvents is Sukkur's trusted marketplace for weddings and events. We connect couples
            and families with the city's best venues, caterers, photographers and decorators — with
            transparent pricing, real availability and a booking flow you can actually trust.
          </p>
        </FadeIn>

        <FadeInStagger className="mt-12 grid gap-5 sm:grid-cols-3">
          {ABOUT_PILLARS.map((p) => (
            <StaggerItem key={p.title}>
              <div className="card-elevated h-full rounded-2xl p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-geist text-h4 font-semibold text-text-primary">{p.title}</h3>
                <p className="mt-2 text-body-sm text-text-secondary">{p.text}</p>
              </div>
            </StaggerItem>
          ))}
        </FadeInStagger>

        <FadeIn delay={0.1} className="mt-10 text-center">
          <Link
            to="/#location"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 px-5 py-2.5 text-body-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-ink-700 dark:text-primary-400 dark:hover:bg-ink-800"
          >
            Visit our office <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </section>

      {/* ── Featured vendors ── */}
      <section id="vendors" className="border-y border-border-subtle bg-slate-50 py-16 dark:bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="flex items-end justify-between gap-4">
            <div>
              <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Handpicked for you
              </p>
              <h2 className="mt-1 font-fraunces text-h2 text-text-primary">Top-rated vendors</h2>
            </div>
            <Link to="/search" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>

          {featLoading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <FadeInStagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sellers.map((s) => (
                <StaggerItem key={s._id}>
                  <SellerCard seller={s} />
                </StaggerItem>
              ))}
            </FadeInStagger>
          )}
        </div>
      </section>

      {/* ── Inspiration (accordion on home, Pinterest on /feed) ── */}
      <section id="inspiration" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Real celebrations
            </p>
            <h2 className="mt-1 font-fraunces text-h2 text-text-primary">Inspiration from Sukkur's best</h2>
          </div>
          <Link to="/feed" className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
            Explore more <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-6">
          {feedPreview && feedPreview.length > 0 ? (
            <AccordionGallery
              items={feedPreview.map((p) => ({
                image: p.mediaUrl,
                label: p.caption || 'Event inspiration',
                link: '/feed',
              }))}
              defaultIndex={1}
              height={440}
              expandRatio={0.52}
              grayscale
              showLabels
            />
          ) : (
            <p className="text-center text-body-sm text-text-tertiary">
              Inspiration posts are on the way — vendors will share their celebrations here soon.
            </p>
          )}
        </FadeIn>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-micro font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
            How it works
          </p>
          <h2 className="mt-1 font-fraunces text-h2 text-text-primary">From dream to celebration in four steps</h2>
          <p className="mt-3 text-body text-text-secondary">
            No phone tag, no vague quotes — a clear path from discovery to deposit.
          </p>
        </FadeIn>
        <FadeIn delay={0.15} className="mt-10">
          <StepList steps={HOW_IT_WORKS} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
        </FadeIn>
      </section>

      {/* ── CTA / Support ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-celebrate p-10 text-center sm:p-16">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-ink-950/10 blur-2xl" />
            <CalendarHeart className="mx-auto h-10 w-10 text-ink-950" />
            <h2 className="mt-4 font-fraunces text-h1 text-ink-950">
              Planning your dream celebration?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-body text-ink-900/80">
              DreamEvents is free for couples. If our platform helped you, buy us a coffee — it keeps
              the lights on and the celebrations growing.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/support"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink-950 px-6 text-body-sm font-semibold text-accent-400 transition-colors hover:bg-ink-900"
              >
                Buy us a coffee
              </Link>
              <Link
                to="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink-950/30 px-6 text-body-sm font-semibold text-ink-950 transition-colors hover:border-ink-950"
              >
                Start planning free
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Visit our office (location) — end of page, before footer ── */}
      <section id="location" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <FadeIn className="grid items-center gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <MapEmbed tall />
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-raised px-3 py-1.5 text-micro font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
              <MapPin className="h-3.5 w-3.5" /> Visit our office
            </span>
            <h2 className="mt-4 font-fraunces text-h2 text-text-primary">Come say hello in Sukkur</h2>
            <p className="mt-3 max-w-md text-body text-text-secondary">
              Our office sits at Dream Palace Marquee in the heart of Sukkur. Drop by to meet the team,
              or book a vendor walkthrough — we'd love to help you plan.
            </p>
            <ul className="mt-5 space-y-2.5 text-body-sm text-text-secondary">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary-600" /> Dream Palace Marquee, Sukkur, Sindh, Pakistan</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary-600" /> hello@dreamevents.pk</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary-600" /> +92 300 000 0000</li>
            </ul>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
