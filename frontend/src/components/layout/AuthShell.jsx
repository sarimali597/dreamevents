import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, Compass } from 'lucide-react';

const VALUE_PROPS = [
  { icon: Compass, title: 'Discover', text: 'Browse venues, caterers, photographers & decor in one place.' },
  { icon: ShieldCheck, title: 'Book with trust', text: 'Transparent estimates and a ledger-backed deposit — no surprises.' },
  { icon: Heart, title: 'Made for Sukkur', text: 'A marketplace built around the vendors and venues we love.' },
];

export function AuthShell({ title, subtitle, children, footer, mode = 'login' }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-surface-sunken">
      <div className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-gradient-celebrate lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-60 w-60 rounded-full bg-ink-950/10 blur-3xl" />
          <Link to="/" className="relative z-10 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-accent-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-fraunces text-xl font-semibold text-ink-950">DreamEvents</span>
          </Link>

          <div className="relative z-10">
            <h2 className="font-fraunces text-display font-medium leading-tight text-ink-950">
              {mode === 'login' ? 'Welcome back to your celebrations.' : 'Plan your perfect event with confidence.'}
            </h2>
            <p className="mt-4 max-w-sm text-body text-ink-900/75">
              {mode === 'login'
                ? 'Sign in to pick up where you left off — your requests, chats and saved vendors are one tap away.'
                : 'Join free as a couple or a vendor. It takes a minute to start planning or start selling.'}
            </p>

            <ul className="mt-8 space-y-4">
              {VALUE_PROPS.map((v) => (
                <li key={v.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-950/10 text-ink-950">
                    <v.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-geist text-body-sm font-semibold text-ink-950">{v.title}</p>
                    <p className="text-micro text-ink-900/70">{v.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-micro text-ink-900/60">
            Trusted by 500+ vendors across Sukkur.
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex h-full flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-7 text-center lg:text-left">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-primary-600 text-white lg:hidden">
                <Sparkles className="h-5 w-5" />
              </span>
              <h1 className="mt-4 font-fraunces text-h1 text-text-primary">{title}</h1>
              {subtitle && <p className="mt-1.5 text-body-sm text-text-secondary">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-body-sm text-text-secondary">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
