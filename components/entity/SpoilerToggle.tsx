"use client";

import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";

/** Hides story-changing spoiler text behind a click. Hidden by default. */
export function SpoilerToggle({ spoiler }: { spoiler: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-md border border-border bg-bg/60">
      <button
        onClick={() => setRevealed((r) => !r)}
        aria-expanded={revealed}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
      >
        {revealed ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
        {revealed ? "Hide spoilers" : "Reveal spoilers"}
      </button>
      {revealed ? (
        <p className="border-t border-border px-3 py-2.5 text-sm leading-relaxed text-text-primary/90">
          {spoiler}
        </p>
      ) : null}
    </div>
  );
}
