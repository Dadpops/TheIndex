"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchResultRow } from "@/components/search/SearchResultRow";
import { entityHref } from "@/lib/ui/href";

/** Prominent home search — fuzzy results appear live with a 150ms debounce. */
export function HomeSearch() {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const debounced = useDebouncedValue(raw, 150);
  const [active, setActive] = useState(0);
  const { ordered, isLoading } = useSearch(debounced);
  const preview = ordered.slice(0, 6);
  const open = debounced.trim().length >= 2;
  const inputRef = useRef<HTMLInputElement>(null);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, preview.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = preview[active];
      if (target) router.push(entityHref(target.entity_type, target.slug));
      else if (raw.trim()) router.push(`/search?q=${encodeURIComponent(raw.trim())}`);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 focus-within:border-text-secondary/60">
        <Search className="size-5 text-text-secondary" />
        <input
          ref={inputRef}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search any character, team, or publisher…"
          className="w-full bg-transparent text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
          aria-label="Search the library"
        />
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl shadow-black/40">
          {preview.length > 0 ? (
            <div className="max-h-80 overflow-y-auto p-1">
              {preview.map((r, i) => (
                <SearchResultRow
                  key={r.id}
                  record={r}
                  active={i === active}
                  onHover={() => setActive(i)}
                />
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-text-secondary">
              {isLoading ? "Searching…" : `No results for “${debounced.trim()}”.`}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
