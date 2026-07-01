import Link from "next/link";
import { dataSource } from "@/lib/data/repository";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <span className="display text-lg tracking-wide text-text-primary">THE INDEX</span>
          <span className="text-text-secondary">— Every character. Every era. Every arc.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search" className="transition-colors hover:text-text-primary">
            Search
          </Link>
          <Link href="/admin" className="transition-colors hover:text-text-primary">
            Admin
          </Link>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: dataSource === "supabase" ? "#1DB954" : "#A08C20" }}
            />
            {dataSource === "supabase" ? "Supabase" : "Local seed"}
          </span>
        </div>
      </div>
    </footer>
  );
}
