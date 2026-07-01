import type { Entity } from "@/types";

/** Extract a 4-digit year from a "first appearance" string, else null. */
export function firstAppearanceYear(value: string | null): number | null {
  if (!value) return null;
  const matches = value.match(/\b(18|19|20)\d{2}\b/g);
  if (!matches || matches.length === 0) return null;
  return Number(matches[matches.length - 1]);
}

export type EntitySort = "name" | "year" | "recent";

export const SORT_LABELS: Record<EntitySort, string> = {
  name: "Name A–Z",
  year: "First appearance",
  recent: "Recently added",
};

export function sortEntities<T extends Entity>(entities: T[], sort: EntitySort): T[] {
  const copy = [...entities];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "year":
      return copy.sort((a, b) => {
        const ya = firstAppearanceYear(a.first_appearance);
        const yb = firstAppearanceYear(b.first_appearance);
        if (ya === null && yb === null) return a.name.localeCompare(b.name);
        if (ya === null) return 1;
        if (yb === null) return -1;
        return ya - yb;
      });
    case "recent":
      return copy.sort((a, b) => b.created_at.localeCompare(a.created_at) || a.name.localeCompare(b.name));
  }
}
