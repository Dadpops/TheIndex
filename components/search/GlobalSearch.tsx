"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchRecord } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { SearchResultRow } from "@/components/search/SearchResultRow";
import { entityHref } from "@/lib/ui/href";

export function GlobalSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const debounced = useDebouncedValue(query, 150);
  const { ordered, characters, teams, isLoading } = useSearch(debounced);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActive(0);
  }, [debounced]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const hasQuery = debounced.trim().length >= 2;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, ordered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = ordered[active];
      if (target) router.push(entityHref(target.entity_type, target.slug));
    }
  }

  const activeId = ordered[active]?.id;

  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 focus-within:border-text-secondary/60">
        <Search className="size-5 text-text-secondary" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search any character, team, or publisher…"
          className="w-full bg-transparent text-base text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
          aria-label="Search the library"
        />
      </div>

      <div ref={listRef} className="mt-6">
        {!hasQuery ? (
          <p className="px-1 py-12 text-center text-sm text-text-secondary">
            Start typing to search the archive — by character, team, or publisher.
          </p>
        ) : ordered.length === 0 ? (
          <p className="px-1 py-12 text-center text-sm text-text-secondary">
            {isLoading
              ? "Searching…"
              : `No results for “${debounced.trim()}”. Try a character name, team, or publisher.`}
          </p>
        ) : (
          <div className="space-y-6">
            <ResultGroup title="Characters" records={characters} activeId={activeId} onHover={setActiveById(ordered, setActive)} />
            <ResultGroup title="Teams" records={teams} activeId={activeId} onHover={setActiveById(ordered, setActive)} />
          </div>
        )}
      </div>
    </div>
  );
}

function setActiveById(ordered: SearchRecord[], setActive: (i: number) => void) {
  return (id: string) => {
    const idx = ordered.findIndex((r) => r.id === id);
    if (idx >= 0) setActive(idx);
  };
}

function ResultGroup({
  title,
  records,
  activeId,
  onHover,
}: {
  title: string;
  records: SearchRecord[];
  activeId?: string;
  onHover: (id: string) => void;
}) {
  if (records.length === 0) return null;
  return (
    <section>
      <h2 className="mb-1.5 px-1 font-mono text-[11px] uppercase tracking-wide text-text-secondary/70">
        {title} · {records.length}
      </h2>
      <div className="rounded-lg border border-border bg-surface/40 p-1">
        {records.map((r) => (
          <SearchResultRow
            key={r.id}
            record={r}
            active={r.id === activeId}
            onHover={() => onHover(r.id)}
          />
        ))}
      </div>
    </section>
  );
}
