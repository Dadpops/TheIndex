"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { EntityWithPublisher, Publisher } from "@/types";
import { saveEntity, type ActionState } from "@/app/admin/actions";

interface EntityFormProps {
  publishers: Publisher[];
  entity?: EntityWithPublisher | null;
}

const initialState: ActionState = { ok: false };

export function EntityForm({ publishers, entity }: EntityFormProps) {
  const [state, formAction, isPending] = useActionState(saveEntity, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {entity ? <input type="hidden" name="id" value={entity.id} /> : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" required defaultValue={entity?.name ?? ""} className={inputCls} />
        </Field>
        <Field label="Slug" required hint="lowercase-kebab-case">
          <input name="slug" required defaultValue={entity?.slug ?? ""} className={inputCls} />
        </Field>
        <Field label="Type" required>
          <select name="entity_type" defaultValue={entity?.entity_type ?? "character"} className={inputCls}>
            <option value="character">Character</option>
            <option value="team">Team</option>
          </select>
        </Field>
        <Field label="Publisher">
          <select name="publisher_id" defaultValue={entity?.publisher_id ?? publishers[0]?.id ?? ""} className={inputCls}>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Real name" hint="characters only">
          <input name="real_name" defaultValue={entity?.real_name ?? ""} className={inputCls} />
        </Field>
        <Field label="First appearance">
          <input
            name="first_appearance"
            placeholder="Detective Comics #27 (1939)"
            defaultValue={entity?.first_appearance ?? ""}
            className={inputCls}
          />
        </Field>
        <Field label="Cover image URL">
          <input name="cover_image_url" defaultValue={entity?.cover_image_url ?? ""} className={inputCls} />
        </Field>
        <Field label="Logo URL">
          <input name="logo_url" defaultValue={entity?.logo_url ?? ""} className={inputCls} />
        </Field>
      </div>

      <Field label="Short bio" hint="2–3 sentences">
        <textarea name="short_bio" rows={3} defaultValue={entity?.short_bio ?? ""} className={inputCls} />
      </Field>

      {state.error ? <p className="text-sm text-marvel">{state.error}</p> : null}
      {state.ok ? (
        <div className="rounded-md border border-image/40 bg-image/5 px-3 py-2 text-sm text-text-primary">
          {state.message}
          {state.id ? (
            <span className="ml-2 text-text-secondary">
              <Link href={`/admin/entities/${state.id}/eras`} className="underline">
                Manage eras →
              </Link>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-border bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary/60 disabled:opacity-50"
        >
          {isPending ? "Saving…" : entity ? "Save changes" : "Create entity"}
        </button>
        <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary">
          Cancel
        </Link>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-secondary/60 focus:outline-none";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-sm text-text-secondary">
        {label}
        {required ? <span className="text-marvel">*</span> : null}
        {hint ? <span className="font-mono text-[10px] text-text-secondary/60">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
