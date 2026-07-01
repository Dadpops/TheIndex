import type { EntityType } from "@/types";

/** Canonical route for an entity, by type. */
export function entityHref(entityType: EntityType, slug: string): string {
  return entityType === "team" ? `/team/${slug}` : `/character/${slug}`;
}
