'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-6 text-center">
      <h1 className="text-h1">Something went wrong</h1>
      <p className="mt-4 max-w-md text-secondary">
        This wasn&apos;t supposed to happen. Please try again — if the problem
        persists, you can head back home.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-lg border border-primary-600 px-6 py-3 font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-500 dark:hover:bg-ink-800"
        >
          Go home
        </a>
      </div>
    </div>
  );
}