import Link from "next/link";
import { notFound } from "next/navigation";
import { getTimeline } from "@/lib/data/repository";
import { adminContext, findEntityById } from "@/lib/admin/context";
import { AdminShell } from "@/components/admin/AdminShell";
import { EraManager } from "@/components/admin/EraManager";

export const dynamic = "force-dynamic";

export default async function ErasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await findEntityById(id);
  if (!entity) notFound();

  const { configured, userEmail } = await adminContext();
  const eras = await getTimeline(entity.id);

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <div className="mb-6">
        <Link href={`/admin/entities/${id}`} className="text-sm text-text-secondary hover:text-text-primary">
          ← {entity.name}
        </Link>
        <h1 className="display mt-1 text-3xl tracking-wide text-text-primary">Eras &amp; Arcs</h1>
      </div>
      <EraManager entityId={entity.id} eras={eras} />
    </AdminShell>
  );
}
