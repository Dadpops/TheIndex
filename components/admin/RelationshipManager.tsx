"use client";

import { useActionState } from "react";
import type { EntityWithPublisher, RelationshipWithEntity } from "@/types";
import { saveRelationship, type ActionState } from "@/app/admin/actions";
import { Banner, Field, SubmitButton, inputCls } from "@/components/admin/formBits";

const initial: ActionState = { ok: false };
const TYPES = ["ally", "enemy", "member", "rival"];

interface RelationshipManagerProps {
  entityId: string;
  relationships: RelationshipWithEntity[];
  entities: EntityWithPublisher[];
}

export function RelationshipManager({ entityId, relationships, entities }: RelationshipManagerProps) {
  const [state, action, pending] = useActionState(saveRelationship, initial);
  const targets = entities.filter((e) => e.id !== entityId);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-surface/40 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">Add relationship</h2>
        <form action={action} className="space-y-3">
          <input type="hidden" name="entity_id" value={entityId} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Related entity" required>
              <select name="related_id" required className={inputCls} defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {targets.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.entity_type})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type" required>
              <select name="relationship" className={inputCls} defaultValue="ally">
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Summary" required>
            <input name="summary" required className={inputCls} />
          </Field>
          <Field label="Notes" required hint="specific story context">
            <textarea name="notes" rows={2} required className={inputCls} />
          </Field>
          <div className="flex items-center gap-3">
            <SubmitButton isPending={pending}>Add relationship</SubmitButton>
            <Banner state={state} />
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
          Existing relationships <span className="font-mono text-xs text-text-secondary">{relationships.length}</span>
        </h2>
        {relationships.length === 0 ? (
          <p className="text-sm text-text-secondary">No relationships yet.</p>
        ) : (
          <div className="space-y-1.5">
            {relationships.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="text-text-primary">{r.related.name}</span>
                <span className="font-mono text-[11px] text-text-secondary">{r.relationship}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
