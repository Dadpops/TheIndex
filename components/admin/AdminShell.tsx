import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, ExternalLink, LogOut, Database } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { dataSource } from "@/lib/data/repository";

interface AdminShellProps {
  children: ReactNode;
  userEmail?: string | null;
  configured: boolean;
}

export function AdminShell({ children, userEmail, configured }: AdminShellProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="display text-2xl tracking-wide text-text-primary">
            Index Admin
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-text-secondary">
            <Database className="size-3" />
            {dataSource === "supabase" ? "Supabase" : "Local seed (read-only)"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="inline-flex items-center gap-1 text-text-secondary transition-colors hover:text-text-primary">
            View site <ExternalLink className="size-3.5" />
          </Link>
          {configured && userEmail ? (
            <form action={signOut}>
              <button className="inline-flex items-center gap-1 text-text-secondary transition-colors hover:text-text-primary">
                <LogOut className="size-3.5" /> Sign out
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {!configured ? (
        <div className="mb-6 rounded-lg border border-accent-muted/40 bg-accent/5 px-4 py-3 text-sm text-text-secondary">
          Supabase is not configured, so editing is disabled. The dashboard below reads the bundled
          local seed. Add Supabase credentials to <span className="font-mono">.env.local</span> and run
          the migration + seed SQL to enable the CMS.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[180px_1fr]">
        <nav className="flex flex-row gap-1 lg:flex-col">
          <AdminNavLink href="/admin" icon={<LayoutDashboard className="size-4" />}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/entities/new" icon={<PlusCircle className="size-4" />}>
            New Entity
          </AdminNavLink>
        </nav>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
    >
      {icon}
      {children}
    </Link>
  );
}
