import { getPublishersWithCounts } from "@/lib/data/repository";
import { adminContext } from "@/lib/admin/context";
import { AdminShell } from "@/components/admin/AdminShell";
import { EntityForm } from "@/components/admin/EntityForm";

export const dynamic = "force-dynamic";

export default async function NewEntityPage() {
  const { configured, userEmail } = await adminContext();
  const publishers = await getPublishersWithCounts();

  return (
    <AdminShell configured={configured} userEmail={userEmail}>
      <h1 className="display mb-6 text-3xl tracking-wide text-text-primary">New Entity</h1>
      <EntityForm publishers={publishers} />
    </AdminShell>
  );
}
