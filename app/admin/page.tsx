import Link from "next/link";
import { getAllEntities, getPublishersWithCounts } from "@/lib/data/repository";
import { getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const configured = isSupabaseConfigured;
  let userEmail: string | null = null;
  if (configured) {
    const supabase = await getServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  }

  const [publishers, entities] = await Promise.all([getPublishersWithCounts(), getAllEntities()]);

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <h1 className="display mb-6 text-3xl tracking-wide text-text-primary">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {publishers.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ backgroundColor: p.color_hex ?? "var(--color-border)" }} />
              <span className="text-sm font-medium text-text-primary">{p.name}</span>
            </div>
            <p className="mt-2 font-mono text-xs text-text-secondary tabular">
              {p.character_count} char · {p.team_count} team
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="display text-xl tracking-wide text-text-primary">
          Entities <span className="font-mono text-sm text-text-secondary">{entities.length}</span>
        </h2>
        <Link
          href="/admin/entities/new"
          className="rounded-md border border-border bg-surface-alt px-3 py-1.5 text-sm text-text-primary transition-colors hover:border-text-secondary/60"
        >
          + New
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-wide text-text-secondary">
              <th className="px-3 py-2">Name</th>
              <th className="hidden px-3 py-2 sm:table-cell">Type</th>
              <th className="hidden px-3 py-2 md:table-cell">Publisher</th>
              <th className="px-3 py-2 text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.id} className="border-b border-border/60 last:border-0 hover:bg-surface/50">
                <td className="px-3 py-2 text-text-primary">{e.name}</td>
                <td className="hidden px-3 py-2 text-text-secondary sm:table-cell">{e.entity_type}</td>
                <td className="hidden px-3 py-2 text-text-secondary md:table-cell">{e.publisher.name}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <Link href={`/admin/entities/${e.id}`} className="text-text-secondary hover:text-text-primary">
                      Edit
                    </Link>
                    <span className="text-border">·</span>
                    <Link href={`/admin/entities/${e.id}/eras`} className="text-text-secondary hover:text-text-primary">
                      Eras
                    </Link>
                    <span className="text-border">·</span>
                    <Link href={`/admin/entities/${e.id}/media`} className="text-text-secondary hover:text-text-primary">
                      Media
                    </Link>
                    <span className="text-border">·</span>
                    <Link href={`/admin/entities/${e.id}/relationships`} className="text-text-secondary hover:text-text-primary">
                      Links
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
