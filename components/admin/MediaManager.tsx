"use client";

import { useActionState } from "react";
import type { MediaEntry } from "@/types";
import { saveMedia, type ActionState } from "@/app/admin/actions";
import { Banner, Field, SubmitButton, inputCls } from "@/components/admin/formBits";
import { MEDIA_TYPE_LABELS } from "@/lib/ui/labels";

const initial: ActionState = { ok: false };
const MEDIA_TYPES = Object.keys(MEDIA_TYPE_LABELS);

export function MediaManager({ entityId, media }: { entityId: string; media: MediaEntry[] }) {
  const [state, action, pending] = useActionState(saveMedia, initial);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-surface/40 p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">Add media</h2>
        <form action={action} className="space-y-3">
          <input type="hidden" name="entity_id" value={entityId} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Title" required>
              <input name="title" required className={inputCls} />
            </Field>
            <Field label="Type" required>
              <select name="media_type" className={inputCls} defaultValue="film">
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MEDIA_TYPE_LABELS[t as keyof typeof MEDIA_TYPE_LABELS]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Release year">
              <input name="release_year" type="number" className={inputCls} />
            </Field>
            <Field label="Watch order">
              <input name="watch_order" type="number" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Platform">
              <input name="platform" placeholder="HBO Max, Disney+…" className={inputCls} />
            </Field>
            <Field label="Where to watch" hint="URL or platform">
              <input name="where_to_watch" className={inputCls} />
            </Field>
          </div>
          <Field label="Notes">
            <textarea name="notes" rows={2} className={inputCls} />
          </Field>
          <div className="flex items-center gap-3">
            <SubmitButton isPending={pending}>Add media</SubmitButton>
            <Banner state={state} />
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
          Existing media <span className="font-mono text-xs text-text-secondary">{media.length}</span>
        </h2>
        {media.length === 0 ? (
          <p className="text-sm text-text-secondary">No media entries yet.</p>
        ) : (
          <div className="space-y-1.5">
            {media.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="text-text-primary">{m.title}</span>
                <span className="font-mono text-[11px] text-text-secondary">
                  {MEDIA_TYPE_LABELS[m.media_type]} · {m.release_year ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
