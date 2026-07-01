// =============================================================================
// Deterministic cover / logo placeholders.
// -----------------------------------------------------------------------------
// Real artwork lives in Supabase Storage. Until an entity has a cover image,
// we render an on-brand generated placeholder: a dark gradient seeded from the
// entity name and tinted by its publisher color, with the entity's initials.
// =============================================================================

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Up to two uppercase initials from an entity name. */
export function initials(name: string): string {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/** A deterministic dark editorial gradient, subtly tinted by the publisher hue. */
export function coverGradient(seed: string, baseHex: string | null): string {
  const h = hashString(seed);
  const angle = h % 360;
  const tint = baseHex ?? "#2A2A35";
  return [
    `linear-gradient(${angle}deg,`,
    ` color-mix(in srgb, ${tint} 22%, #16161A) 0%,`,
    ` #131318 55%,`,
    ` color-mix(in srgb, ${tint} 10%, #0D0D0F) 100%)`,
  ].join("");
}

/** A faint halftone dot texture layered over the gradient. */
export const halftone =
  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)";

/**
 * A vivid, deterministic "cover art" background for entities without real
 * artwork — a directional duotone of the publisher color with a light radial
 * highlight from a seeded corner. Distinct per character, fully on-brand, and
 * pure CSS (no external images). Pair with the `halftone` overlay + initials.
 */
export function coverArt(seed: string, baseHex: string | null): string {
  const h = hashString(seed);
  const base = baseHex ?? "#2A2A35";
  const angle = h % 360;
  const corners = ["20% 20%", "80% 20%", "20% 80%", "80% 80%"];
  const corner = corners[h % corners.length];
  return [
    `radial-gradient(120% 120% at ${corner}, color-mix(in srgb, ${base} 55%, #ffffff) 0%, transparent 45%)`,
    `linear-gradient(${angle}deg, color-mix(in srgb, ${base} 90%, #000000) 0%, ${base} 42%, color-mix(in srgb, ${base} 45%, #0D0D0F) 100%)`,
  ].join(", ");
}
