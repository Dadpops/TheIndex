"use client";

import { RelationshipGrid } from "@/components/entity/RelationshipGrid";

export function EnemiesTab({ slug }: { slug: string }) {
  return (
    <RelationshipGrid
      slug={slug}
      type="enemy"
      emptyTitle="No enemies recorded yet."
      emptyHint="Adversaries will appear here as they're added."
    />
  );
}
