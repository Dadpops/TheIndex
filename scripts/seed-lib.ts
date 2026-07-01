// =============================================================================
// Shared seed-ingest library: normalization + validation.
// -----------------------------------------------------------------------------
// Used by validate-seed.ts (report only) and ingest-seed.ts (standardize +
// promote). Keeping the rules in one place means "what the validator checks"
// and "what the ingester enforces" can never drift apart.
// =============================================================================

import type { EntitySeed } from "../lib/data/seed/schema";

export const ENTITY_TYPES = ["character", "team"];
export const ROLES = ["hero", "villain", "antihero", "neutral"];
export const PUBS = ["dc", "marvel", "image", "boom"];
export const ARC_TYPES = ["origin", "flagship", "crossover", "elseworlds", "annual", "miniseries", "tie-in", "retcon"];
export const FORMATS = ["trade", "omnibus", "single_issues", "digital", "hardcover"];
export const REL_TYPES = ["ally", "enemy", "member", "rival"];
export const MEDIA_TYPES = ["animated_series", "live_action", "film", "video_game", "podcast", "audio_drama"];
export const TEAM_ROLES = ["founder", "leader", "member", "honorary"];
export const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Canonical slug aliases — collapses known variant spellings onto the slug the
 * library already uses, so cross-batch links resolve. Extend as you discover
 * new variants. Applied to entity slugs AND entity references.
 */
export const SLUG_ALIASES: Record<string, string> = {
  "ras-al-ghul": "ra-s-al-ghul",
  "rasalghul": "ra-s-al-ghul",
  "the-joker": "joker",
};

export interface Issue {
  level: "error" | "warn";
  where: string;
  msg: string;
}

export interface Bundle {
  primary: EntitySeed;
  supporting: EntitySeed[];
}

export function isStr(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}
export function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function arr<T>(v: T[] | undefined | null): T[] {
  return Array.isArray(v) ? v : [];
}

/** Lowercase kebab-case slug, preserving existing single dashes. */
export function slugify(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Slugify then map through known aliases (for entity slugs + references). */
export function canonicalSlug(value: unknown): string {
  const s = slugify(value);
  return SLUG_ALIASES[s] ?? s;
}

// -----------------------------------------------------------------------------
// Normalization (standardize a raw research bundle into canonical shape).
// -----------------------------------------------------------------------------

function normalizeEntity(e: EntitySeed): void {
  e.slug = canonicalSlug(e.slug);
  if (typeof e.name === "string") e.name = e.name.trim();
  // Images are app-generated; never trust inbound URLs.
  e.logo_url = null;
  e.cover_image_url = null;
  if (typeof e.short_bio === "string") e.short_bio = e.short_bio.trim();
  if (typeof e.first_appearance === "string") e.first_appearance = e.first_appearance.trim();
  if (e.entity_type === "team") e.real_name = null;

  for (const era of arr(e.eras)) {
    era.slug = slugify(era.slug);
    for (const arc of arr(era.arcs)) {
      arc.slug = slugify(arc.slug);
      if (arc.spoiler === undefined) arc.spoiler = null;
      for (const r of arr(arc.reading_entries)) {
        if (r.purchase_url === undefined) r.purchase_url = null;
      }
    }
  }
  for (const sh of arr(e.start_here)) sh.arc_slug = slugify(sh.arc_slug);
  for (const r of arr(e.relationships)) r.related_slug = canonicalSlug(r.related_slug);
  if (Array.isArray(e.team_members)) {
    for (const m of e.team_members) {
      m.character_slug = canonicalSlug(m.character_slug);
      if (m.era_slug) m.era_slug = slugify(m.era_slug);
    }
  }
}

/** Turn raw parsed JSON (bundle or bare entity) into a normalized Bundle. */
export function normalizeBundle(raw: unknown): Bundle {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const isBundle = typeof obj === "object" && obj !== null && "primary" in obj;
  const primary = (isBundle ? obj.primary : obj) as EntitySeed;
  const supporting = (isBundle ? ((obj.supporting as EntitySeed[] | undefined) ?? []) : []) as EntitySeed[];
  normalizeEntity(primary);
  for (const s of supporting) normalizeEntity(s);
  return { primary, supporting };
}

// -----------------------------------------------------------------------------
// Validation.
// -----------------------------------------------------------------------------

function collectArcSlugs(e: EntitySeed): Set<string> {
  const set = new Set<string>();
  for (const era of arr(e.eras)) for (const arc of arr(era.arcs)) if (isStr(arc?.slug)) set.add(arc.slug);
  return set;
}

function validateEntity(e: EntitySeed, isPrimary: boolean, issues: Issue[]) {
  const id = isStr(e?.slug) ? e.slug : "(missing slug)";
  const at = (f: string) => `${id} › ${f}`;
  const err = (where: string, msg: string) => issues.push({ level: "error", where, msg });
  const warn = (where: string, msg: string) => issues.push({ level: "warn", where, msg });

  if (!isStr(e?.slug)) err(id, "missing/empty slug");
  else if (!KEBAB.test(e.slug)) err(at("slug"), `not kebab-case: "${e.slug}"`);
  if (!isStr(e?.name)) err(at("name"), "missing/empty name");
  if (!ENTITY_TYPES.includes(e?.entity_type)) err(at("entity_type"), `invalid: "${e?.entity_type}"`);
  if (!ROLES.includes(e?.role as string)) err(at("role"), `invalid role: "${e?.role}"`);
  if (!PUBS.includes(e?.publisher_slug)) err(at("publisher_slug"), `invalid: "${e?.publisher_slug}"`);
  if (!isStr(e?.first_appearance)) warn(at("first_appearance"), "missing first_appearance");
  if (!isStr(e?.short_bio)) err(at("short_bio"), "missing/empty short_bio");

  const arcSlugs = collectArcSlugs(e);
  const eras = arr(e?.eras);
  if (eras.length === 0) err(at("eras"), "no eras");
  else if (isPrimary && eras.length < 2) warn(at("eras"), `only ${eras.length} era(s) (recommended ≥2, ≥3 flagship)`);

  for (const era of eras) {
    const eat = (f: string) => at(`era[${isStr(era?.slug) ? era.slug : "?"}].${f}`);
    if (!isStr(era?.slug)) err(eat("slug"), "missing era slug");
    if (!isStr(era?.title)) err(eat("title"), "missing era title");
    if (!isNum(era?.order_index)) err(eat("order_index"), "order_index must be a number");
    const arcs = arr(era?.arcs);
    if (arcs.length === 0) err(eat("arcs"), "era has no arcs");
    else if (isPrimary && arcs.length < 2) warn(eat("arcs"), `only ${arcs.length} arc(s) (recommended ≥2)`);
    for (const arc of arcs) {
      const aat = (f: string) => at(`arc[${isStr(arc?.slug) ? arc.slug : "?"}].${f}`);
      if (!isStr(arc?.slug)) err(aat("slug"), "missing arc slug");
      if (!isStr(arc?.title)) err(aat("title"), "missing arc title");
      if (!isStr(arc?.logline)) err(aat("logline"), "missing logline");
      if (!isStr(arc?.summary)) err(aat("summary"), "missing summary");
      if (!ARC_TYPES.includes(arc?.arc_type)) err(aat("arc_type"), `invalid arc_type: "${arc?.arc_type}"`);
      if (!isNum(arc?.order_index)) err(aat("order_index"), "order_index must be a number");
      const reading = arr(arc?.reading_entries);
      if (reading.length === 0) err(aat("reading_entries"), "arc has no reading entries");
      for (const r of reading) {
        const rat = at(`reading["${isStr(r?.title) ? r.title : "?"}"]`);
        if (!isStr(r?.title)) err(rat, "missing reading title");
        if (!FORMATS.includes(r?.format)) err(`${rat}.format`, `invalid format: "${r?.format}"`);
        if (!isNum(r?.reading_order)) err(`${rat}.reading_order`, "reading_order must be a number");
        if (!isNum(r?.publication_order)) err(`${rat}.publication_order`, "publication_order must be a number");
      }
    }
  }

  const sh = arr(e?.start_here);
  if (isPrimary && sh.length !== 3) err(at("start_here"), `expected exactly 3, got ${sh.length}`);
  for (const s of sh) {
    const sat = at(`start_here[${isNum(s?.order_index) ? s.order_index : "?"}]`);
    if (![1, 2, 3].includes(s?.order_index)) err(`${sat}.order_index`, `must be 1|2|3, got ${s?.order_index}`);
    if (!isStr(s?.label)) err(`${sat}.label`, "missing label");
    if (!isStr(s?.reason)) err(`${sat}.reason`, "missing reason");
    if (!isStr(s?.arc_slug)) err(`${sat}.arc_slug`, "missing arc_slug");
    else if (!arcSlugs.has(s.arc_slug)) err(`${sat}.arc_slug`, `references unknown arc "${s.arc_slug}"`);
  }

  const media = arr(e?.media);
  if (isPrimary && media.length < 3) warn(at("media"), `only ${media.length} media (recommended ≥3)`);
  for (const m of media) {
    if (!MEDIA_TYPES.includes(m?.media_type)) err(at(`media["${m?.title ?? "?"}"]`), `invalid media_type: "${m?.media_type}"`);
    if (!isStr(m?.title)) err(at("media"), "media entry missing title");
  }

  const rels = arr(e?.relationships);
  for (const r of rels) {
    if (!REL_TYPES.includes(r?.relationship)) err(at(`rel→${r?.related_slug ?? "?"}`), `invalid type: "${r?.relationship}"`);
    if (!isStr(r?.related_slug)) err(at("relationships"), "relationship missing related_slug");
  }
  if (isPrimary && e?.entity_type === "character") {
    const allies = rels.filter((r) => r?.relationship === "ally").length;
    const enemies = rels.filter((r) => r?.relationship === "enemy").length;
    if (allies < 4) err(at("relationships"), `only ${allies} ally relationship(s) (need ≥4)`);
    if (enemies < 4) err(at("relationships"), `only ${enemies} enemy relationship(s) (need ≥4)`);
  }
  if (e?.entity_type === "team") {
    const tm = arr(e?.team_members);
    if (isPrimary && tm.length < 3) warn(at("team_members"), `only ${tm.length} member(s)`);
    for (const m of tm) {
      if (!isStr(m?.character_slug)) err(at("team_members"), "member missing character_slug");
      if (m?.role && !TEAM_ROLES.includes(m.role)) err(at(`member→${m?.character_slug}`), `invalid role: "${m?.role}"`);
    }
  }
}

/** Validate a (normalized) bundle. `knownSlugs` resolves cross-references. */
export function validateBundle(bundle: Bundle, knownSlugs: Set<string>): Issue[] {
  const issues: Issue[] = [];
  const entities: { e: EntitySeed; isPrimary: boolean }[] = [
    { e: bundle.primary, isPrimary: true },
    ...bundle.supporting.map((e) => ({ e, isPrimary: false })),
  ];
  for (const { e, isPrimary } of entities) {
    validateEntity(e, isPrimary, issues);
    const label = isStr(e?.slug) ? e.slug : "(?)";
    for (const r of arr(e?.relationships)) {
      if (isStr(r?.related_slug) && !knownSlugs.has(r.related_slug)) {
        issues.push({ level: "error", where: `${label} › rel→${r.related_slug}`, msg: `dangling reference "${r.related_slug}"` });
      }
    }
    if (e?.entity_type === "team") {
      for (const m of arr(e?.team_members)) {
        if (isStr(m?.character_slug) && !knownSlugs.has(m.character_slug)) {
          issues.push({ level: "error", where: `${label} › member→${m.character_slug}`, msg: `dangling reference "${m.character_slug}"` });
        }
      }
    }
  }
  return issues;
}

/** All slugs (primary + supporting) in a bundle. */
export function bundleSlugs(bundle: Bundle): string[] {
  return [bundle.primary, ...bundle.supporting].map((e) => e?.slug).filter((s): s is string => isStr(s));
}
