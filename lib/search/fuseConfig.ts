import type { IFuseOptions } from "fuse.js";
import type { Entity, SearchRecord } from "@/types";

/**
 * Shared Fuse.js options. Name matches dominate; slug and bio are lighter
 * signals. `ignoreLocation` lets matches land anywhere in the field, and a
 * moderate threshold keeps fuzzy typos forgiving without going noisy.
 */
export const globalSearchOptions: IFuseOptions<SearchRecord> = {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "slug", weight: 0.2 },
    { name: "short_bio", weight: 0.1 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
};

/** Options for the publisher-scoped entity search (works over Entity rows). */
export const entitySearchOptions: IFuseOptions<Entity> = {
  keys: [
    { name: "name", weight: 0.7 },
    { name: "slug", weight: 0.15 },
    { name: "short_bio", weight: 0.15 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
};
