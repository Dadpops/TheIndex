import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="display text-7xl tracking-wide text-text-primary">404</p>
      <p className="mt-2 text-lg text-text-primary">This page isn&apos;t in the archive.</p>
      <p className="mt-1 text-sm text-text-secondary">
        The character, team, or publisher you&apos;re looking for doesn&apos;t exist here yet.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-md border border-border bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary/60"
        >
          Back to library
        </Link>
        <Link
          href="/search"
          className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
