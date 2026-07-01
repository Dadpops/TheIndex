"use client";

import type { ReactNode } from "react";
import type { ActionState } from "@/app/admin/actions";

export const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-secondary/60 focus:outline-none";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-xs text-text-secondary">
        {label}
        {required ? <span className="text-marvel">*</span> : null}
        {hint ? <span className="font-mono text-[10px] text-text-secondary/60">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function Banner({ state }: { state: ActionState }) {
  if (state.error) return <p className="text-sm text-marvel">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-image">{state.message ?? "Saved."}</p>;
  return null;
}

export function SubmitButton({ children, isPending }: { children: ReactNode; isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="rounded-md border border-border bg-surface-alt px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:border-text-secondary/60 disabled:opacity-50"
    >
      {isPending ? "Saving…" : children}
    </button>
  );
}
