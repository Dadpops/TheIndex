"use client";

import { useActionState } from "react";
import type { EraWithArcs } from "@/types";
import { saveArc, saveEra, type ActionState } from "@/app/admin/actions";
import { Banner, Field, SubmitButton, inputCls } from "@/components/admin/formBits";
import { ARC_TYPE_LABELS } from "@/lib/ui/labels";

const initial: ActionState = { ok: false };
const ARC_TYPES = Object.keys(ARC_TYPE_LABELS);

export function EraManager({ entityId, eras }: { entityId: string; eras: EraWithArcs[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-surface/40 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">Add era</h2>
        <AddEraForm entityId={entityId} nextOrder={eras.length + 1} />
      </section>

      {eras.length === 0 ? (
        <p className="text-sm text-text-secondary">No eras yet. Add the first one above.</p>
      ) : (
        eras.map((era) => (
          <section key={era.id} className="rounded-lg border border-border">
            <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
              <span className="display text-xl tracking-wide text-text-primary">{era.title}</span>
              <span className="font-mono text-[11px] text-text-secondary">
                #{era.order_index} · {era.arcs.length} arcs
              </span>
            </header>
            <div className="space-y-2 px-4 py-3">
              {era.arcs.map((arc) => (
                <div key={arc.id} className="flex items-center justify-between rounded-md border border-border/60 bg-bg/40 px-3 py-2 text-sm">
                  <span className="text-text-primary">{arc.title}</span>
                  <span className="font-mono text-[11px] text-text-secondary">{arc.arc_type}</span>
                </div>
              ))}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary">
                  + Add arc to {era.title}
                </summary>
                <div className="mt-3">
                  <AddArcForm entityId={entityId} eraId={era.id} nextOrder={era.arcs.length + 1} />
                </div>
              </details>
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function AddEraForm({ entityId, nextOrder }: { entityId: string; nextOrder: number }) {
  const [state, action, pending] = useActionState(saveEra, initial);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="entity_id" value={entityId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Title" required>
          <input name="title" required className={inputCls} />
        </Field>
        <Field label="Slug" required>
          <input name="slug" required className={inputCls} />
        </Field>
        <Field label="Start year">
          <input name="start_year" type="number" className={inputCls} />
        </Field>
        <Field label="End year">
          <input name="end_year" type="number" className={inputCls} />
        </Field>
      </div>
      <Field label="Order index" required>
        <input name="order_index" type="number" defaultValue={nextOrder} className={inputCls} />
      </Field>
      <Field label="Summary">
        <textarea name="summary" rows={2} className={inputCls} />
      </Field>
      <div className="flex items-center gap-3">
        <SubmitButton isPending={pending}>Add era</SubmitButton>
        <Banner state={state} />
      </div>
    </form>
  );
}

function AddArcForm({ entityId, eraId, nextOrder }: { entityId: string; eraId: string; nextOrder: number }) {
  const [state, action, pending] = useActionState(saveArc, initial);
  return (
    <form action={action} className="space-y-3 rounded-md border border-border/60 bg-surface/40 p-3">
      <input type="hidden" name="entity_id" value={entityId} />
      <input type="hidden" name="era_id" value={eraId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Title" required>
          <input name="title" required className={inputCls} />
        </Field>
        <Field label="Slug" required>
          <input name="slug" required className={inputCls} />
        </Field>
        <Field label="Type" required>
          <select name="arc_type" className={inputCls} defaultValue="flagship">
            {ARC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Order" required>
          <input name="order_index" type="number" defaultValue={nextOrder} className={inputCls} />
        </Field>
      </div>
      <Field label="Logline" required>
        <input name="logline" required className={inputCls} />
      </Field>
      <Field label="Summary" required>
        <textarea name="summary" rows={3} required className={inputCls} />
      </Field>
      <Field label="Spoiler" hint="optional">
        <textarea name="spoiler" rows={2} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start year">
          <input name="start_year" type="number" className={inputCls} />
        </Field>
        <Field label="End year">
          <input name="end_year" type="number" className={inputCls} />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton isPending={pending}>Add arc</SubmitButton>
        <Banner state={state} />
      </div>
    </form>
  );
}
