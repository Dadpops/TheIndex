"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="display text-5xl tracking-wide text-text-primary">Something broke</p>
      <p className="mt-2 text-sm text-text-secondary">
        An unexpected error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md border border-border bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary/60"
      >
        Try again
      </button>
    </div>
  );
}
