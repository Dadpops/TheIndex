"use client";

import { useMemo } from "react";
import type { Entity } from "@/types";
import { firstAppearanceYear } from "@/lib/ui/sort";

export type RoleFilter = "all" | "hero" | "villain" | "antihero" | "neutral";
export type EntitySortKey = "name_asc" | "name_desc" | "first_appearance_asc";

export const ENTITY_SORT_LABELS: Record<EntitySortKey, string> = {
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
  first_appearance_asc: "First appearance",
};

/**
 * Client-side role filter + sort for an entity list. Filter and sort compose,
 * so e.g. "villains sorted by name" works in one pass. Pure derivation — no
 * refetch.
 */
export function useEntityFilter<T extends Entity>(
  entities: T[],
  role: RoleFilter,
  sort: EntitySortKey,
): T[] {
  return useMemo(() => {
    const filtered = role === "all" ? entities : entities.filter((e) => e.role === role);
    const sorted = [...filtered];
    switch (sort) {
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "first_appearance_asc":
        sorted.sort((a, b) => {
          const ya = firstAppearanceYear(a.first_appearance);
          const yb = firstAppearanceYear(b.first_appearance);
          if (ya === null && yb === null) return a.name.localeCompare(b.name);
          if (ya === null) return 1;
          if (yb === null) return -1;
          return ya - yb;
        });
        break;
    }
    return sorted;
  }, [entities, role, sort]);
}
