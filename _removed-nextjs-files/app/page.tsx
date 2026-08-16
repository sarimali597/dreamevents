import Link from 'next/link';
import ThemeToggle from '@/components/layout/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-gradient-trust px-6 py-24 text-center text-white">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-accent-500">
          Weddings · Mehndis · Engagements · Events
        </p>
        <h1 className="max-w-3xl text-display font-medium leading-tight">
          Find the perfect venue for your perfect day
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Verified venues, caterers, photographers, and decorators in Sukkur —
          search, compare, negotiate, and book with confidence.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explore"
            className="rounded-lg bg-accent-600 px-8 py-4 text-base font-medium text-ink-950 shadow-lg transition-colors hover:bg-accent-500"
          >
            Explore vendors
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-lg border border-white/30 px-8 py-4 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            How it works
          </Link>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-6 py-20 text-center"
      >
        <h2 className="text-h2">How it works</h2>
        <p className="mx-auto mt-4 max-w-2xl text-secondary">
          From first search to confirmed booking in six simple steps.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['01', 'Search', 'Browse verified vendors in Sukkur by category.'],
            ['02', 'Compare', 'Side-by-side pricing, ratings, and inclusions.'],
            ['03', 'Check availability', 'Live calendars — see what is free at a glance.'],
            ['04', 'Request', 'Send a booking request in under a minute.'],
            ['05', 'Negotiate', 'Structured estimates and chat — no WhatsApp threads.'],
            ['06', 'Confirm', 'Pay the deposit directly to the vendor. Done.'],
          ].map(([step, title, text]) => (
            <div
              key={step}
              className="rounded-lg border border-border-default bg-surface-raised p-8 text-left shadow-sm transition-shadow hover:shadow-md dark:border-ink-700"
            >
              <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-500">
                {step}
              </span>
              <h3 className="mt-3 text-h3">{title}</h3>
              <p className="mt-2 text-body-sm text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between bg-ink-950 px-6 py-6 text-sm text-slate-400">
        <p>© {new Date().getFullYear()} DreamEvents</p>
        <div className="flex items-center gap-4">
          <Link
            href="https://sarimfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Crafted by Sarim
          </Link>
          <ThemeToggle />
        </div>
      </footer>
    </main>
  );
}