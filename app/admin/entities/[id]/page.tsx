import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishersWithCounts } from "@/lib/data/repository";
import { adminContext, findEntityById } from "@/lib/admin/context";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityForm } from "@/components/admin/EntityForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntityPage({ params }: PageProps) {
  const { id } = await params;
  const entity = await findEntityById(id);
  if (!entity) notFound();

  const { configured, userEmail } = await adminContext();
  const publishers = await getPublishersWithCounts();

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-3xl tracking-wide text-text-primary">Edit · {entity.name}</h1>
        <div className="flex gap-3 text-sm">
          <Link href={`/admin/entities/${id}/eras`} className="text-text-secondary hover:text-text-primary">
            Eras &amp; Arcs
          </Link>
          <Link href={`/admin/entities/${id}/media`} className="text-text-secondary hover:text-text-primary">
            Media
          </Link>
          <Link href={`/admin/entities/${id}/relationships`} className="text-text-secondary hover:text-text-primary">
            Relationships
          </Link>
        </div>
      </div>
      <EntityForm publishers={publishers} entity={entity} />
    </AdminShell>
  );
}
