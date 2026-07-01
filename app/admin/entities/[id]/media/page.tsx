import Link from "next/link";
import { notFound } from "next/navigation";
import { getMedia } from "@/lib/data/repository";
import { adminContext, findEntityById } from "@/lib/admin/context";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaManager } from "@/components/admin/MediaManager";

export const dynamic = "force-dynamic";

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entity = await findEntityById(id);
  if (!entity) notFound();

  const { configured, userEmail } = await adminContext();
  const media = await getMedia(entity.id);

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <div className="mb-6">
        <Link href={`/admin/entities/${id}`} className="text-sm text-text-secondary hover:text-text-primary">
          ← {entity.name}
        </Link>
        <h1 className="display mt-1 text-3xl tracking-wide text-text-primary">Media</h1>
      </div>
      <MediaManager entityId={entity.id} media={media} />
    </AdminShell>
  );
}
