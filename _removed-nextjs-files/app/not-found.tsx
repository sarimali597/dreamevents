import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-white">
      <p className="font-mono text-sm tracking-widest text-accent-500">
        404
      </p>
      <h1 className="mt-4 text-h1">Page not found</h1>
      <p className="mt-4 max-w-md text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Try a
        search instead — or explore popular categories.
      </p>
      <form action="/explore" className="mt-8 w-full max-w-md">
        <input
          type="search"
          name="q"
          placeholder="Search venues, caterers, photographers…"
          className="h-14 w-full rounded-lg border border-white/20 bg-white/10 px-5 text-white placeholder:text-slate-400 focus:border-accent-500 focus:outline-none"
        />
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {[
          ['Venues', '/venues/sukkur'],
          ['Catering', '/catering/sukkur'],
          ['Photography', '/photography/sukkur'],
          ['Decoration', '/decoration/sukkur'],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-accent-500 hover:text-accent-500"
          >
            {label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent-600 px-8 py-3 font-medium text-ink-950 transition-colors hover:bg-accent-500"
      >
        Back home
      </Link>
    </div>
  );
}