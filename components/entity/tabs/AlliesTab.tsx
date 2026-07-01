"use client";

import { RelationshipGrid } from "@/components/entity/RelationshipGrid";

export function AlliesTab({ slug }: { slug: string }) {
  return (
    <RelationshipGrid
      slug={slug}
      type="ally"
      emptyTitle="No allies recorded yet."
      emptyHint="Allies will appear here as they're added."
    />
  );
}
