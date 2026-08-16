export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-base">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm text-secondary">Loading DreamEvents…</p>
    </div>
  );
}