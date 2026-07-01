"use client";

import { Search, X } from "lucide-react";

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Controlled, scoped search input (used on publisher pages). */
export function EntitySearch({ value, onChange, placeholder = "Search…" }: EntitySearchProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 focus-within:border-text-secondary/60">
      <Search className="size-4 shrink-0 text-text-secondary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
        aria-label={placeholder}
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
