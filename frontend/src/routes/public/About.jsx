import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Users, Compass, Handshake, MapPin, Mail, Phone } from 'lucide-react';
import { FadeIn } from '../../components/effects/FadeIn.jsx';
import { MapEmbed } from '../../components/ui/MapEmbed.jsx';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust first',
    text: 'Verified vendors, transparent pricing and a ledger-backed deposit system — no surprise charges, no shady haggling.',
  },
  {
    icon: Compass,
    title: 'Discovery made easy',
    text: 'Browse venues, caterers, photographers and decorators by category, city and budget in one place.',
  },
  {
    icon: Handshake,
    title: 'Vendors win too',
    text: 'A free professional storefront, structured quotes and a real calendar — so sellers spend time delivering, not chasing.',
  },
  {
    icon: Heart,
    title: 'Built for Sukkur',
    text: 'A marketplace made for our city first, with the people and venues we actually know and love.',
  },
];

const STATS = [
  { value: '500+', label: 'Verified vendors' },
  { value: '12k+', label: 'Celebrations planned' },
  { value: '4.8★', label: 'Average rating' },
  { value: '100%', label: 'Sukkur focus' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <FadeIn className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1.5 text-micro font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
          <Sparkles className="h-3.5 w-3.5" /> About DreamEvents
        </span>
        <h1 className="mt-6 font-fraunces text-h1 text-text-primary">
          We make event planning feel like celebration, not chaos.
        </h1>
        <p className="mt-5 text-body text-text-secondary">
          DreamEvents is Sukkur's trusted marketplace for weddings and events. We connect couples and
          families with the city's best venues, caterers, photographers and decorators — with
          transparent pricing, real availability and a booking flow you can actually trust.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card-elevated rounded-2xl p-6 text-center">
            <p className="font-fraunces text-h2 font-semibold text-primary-600 dark:text-primary-400">{s.value}</p>
            <p className="mt-1 text-micro text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </FadeIn>

      <FadeIn delay={0.15} className="mt-16">
        <h2 className="font-fraunces text-h2 text-text-primary">What we stand for</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="card-elevated rounded-2xl p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-geist text-h4 font-semibold text-text-primary">{v.title}</h3>
              <p className="mt-2 text-body-sm text-text-secondary">{v.text}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="relative mt-16 overflow-hidden rounded-2xl bg-gradient-celebrate p-10 text-center sm:p-16">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <Users className="mx-auto h-10 w-10 text-ink-950" />
        <h2 className="mt-4 font-fraunces text-h1 text-ink-950">Planning something unforgettable?</h2>
        <p className="mx-auto mt-3 max-w-xl text-body text-ink-900/80">
          Start free — browse vendors, send a request and get your estimate. If DreamEvents helped
          you, buy us a coffee to keep the celebrations growing.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/search"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink-950 px-6 text-body-sm font-semibold text-accent-400 transition-colors hover:bg-ink-900"
          >
            Browse vendors
          </Link>
          <Link
            to="/signup"
            className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-ink-950/30 px-6 text-body-sm font-semibold text-ink-950 transition-colors hover:border-ink-950"
          >
            Create an account
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={0.25} className="mt-16 scroll-mt-24" id="location">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-raised px-3 py-1.5 text-micro font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
              <MapPin className="h-3.5 w-3.5" /> Visit our office
            </span>
            <h2 className="mt-4 font-fraunces text-h2 text-text-primary">Come say hello in Sukkur</h2>
            <p className="mt-3 max-w-md text-body text-text-secondary">
              Our office sits at Dream Palace Marquee in the heart of Sukkur. Drop by to meet the team,
              or book a vendor walkthrough — we'd love to help you plan.
            </p>
            <ul className="mt-5 space-y-2.5 text-body-sm text-text-secondary">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-600" /> Dream Palace Marquee, Sukkur, Sindh, Pakistan</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-600" /> hello@dreamevents.pk</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-600" /> +92 300 000 0000</li>
            </ul>
          </div>
          <MapEmbed tall />
        </div>
      </FadeIn>

      <p className="mt-12 text-center text-micro text-text-tertiary">
        DreamEvents is crafted by{' '}
        <a
          href="https://sarimfolio.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          Sarim
        </a>
        .
      </p>
    </div>
  );
}
