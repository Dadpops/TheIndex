import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllEntities, getRelationships } from "@/lib/data/repository";
import { adminContext, findEntityById } from "@/lib/admin/context";
import { AdminShell } from "@/components/admin/AdminShell";
import { RelationshipManager } from "@/components/admin/RelationshipManager";

export const dynamic = "force-dynamic";

export default async function RelationshipsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await findEntityById(id);
  if (!entity) notFound();

  const { configured, userEmail } = await adminContext();
  const [relationships, entities] = await Promise.all([getRelationships(entity.id), getAllEntities()]);

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <div className="mb-6">
        <Link href={`/admin/entities/${id}`} className="text-sm text-text-secondary hover:text-text-primary">
          ← {entity.name}
        </Link>
        <h1 className="display mt-1 text-3xl tracking-wide text-text-primary">Relationships</h1>
      </div>
      <RelationshipManager entityId={entity.id} relationships={relationships} entities={entities} />
    </AdminShell>
  );
}
