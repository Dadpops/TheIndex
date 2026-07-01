// =============================================================================
// Deterministic UUID generation.
// -----------------------------------------------------------------------------
// Seed content is authored without ids; ids are derived deterministically from
// stable keys (slugs + order). The SAME function produces ids for the in-app
// local dataset AND the generated Supabase `seed.sql`, so foreign keys line up
// across both backends and rebuilds stay stable. Postgres `uuid` columns accept
// any RFC-4122-formatted string, which is all we need here.
// =============================================================================

/** cyrb128 — a fast, well-distributed 128-bit string hash (public domain). */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * Derive a stable, valid v5-shaped UUID from an arbitrary key string.
 * Not cryptographically secure — it only needs to be deterministic and
 * collision-resistant across our seed keys.
 */
export function uuidFromKey(key: string): string {
  const parts = cyrb128(key);
  const hex = parts.map((n) => n.toString(16).padStart(8, "0")).join("");
  const chars = hex.split("");
  chars[12] = "5"; // version nibble
  chars[16] = (((parseInt(chars[16], 16) & 0x3) | 0x8) >>> 0).toString(16); // variant
  const h = chars.join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/** Namespaced id helper to keep keys readable and collision-free per table. */
export const id = {
  publisher: (slug: string) => uuidFromKey(`publisher:${slug}`),
  entity: (slug: string) => uuidFromKey(`entity:${slug}`),
  era: (entitySlug: string, eraSlug: string) => uuidFromKey(`era:${entitySlug}:${eraSlug}`),
  arc: (entitySlug: string, eraSlug: string, arcSlug: string) =>
    uuidFromKey(`arc:${entitySlug}:${eraSlug}:${arcSlug}`),
  reading: (entitySlug: string, eraSlug: string, arcSlug: string, order: number) =>
    uuidFromKey(`reading:${entitySlug}:${eraSlug}:${arcSlug}:${order}`),
  startHere: (entitySlug: string, order: number) => uuidFromKey(`starthere:${entitySlug}:${order}`),
  relationship: (entitySlug: string, relatedSlug: string, kind: string) =>
    uuidFromKey(`rel:${entitySlug}:${relatedSlug}:${kind}`),
  media: (entitySlug: string, type: string, title: string) =>
    uuidFromKey(`media:${entitySlug}:${type}:${title}`),
  teamMember: (teamSlug: string, charSlug: string, eraSlug: string | null) =>
    uuidFromKey(`member:${teamSlug}:${charSlug}:${eraSlug ?? "all"}`),
};
