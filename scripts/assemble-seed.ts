// =============================================================================
// Assemble seed content.
// -----------------------------------------------------------------------------
// Reads the per-entity JSON files produced by the seed workflow
// (lib/data/seed/generated/*.json), each shaped { primary, supporting }, then:
//   - flattens primaries + supporting into one entity list
//   - dedupes by slug (primary wins; otherwise first writer wins)
//   - validates that relationship/team-member references resolve
//   - injects the four publishers
//   - writes lib/data/seed/content.json
//
// Run with:  npx tsx scripts/assemble-seed.ts
// =============================================================================

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { EntitySeed, PublisherSeed } from "../lib/data/seed/schema";

const SEED_DIR = join(process.cwd(), "lib", "data", "seed");
const GENERATED_DIR = join(SEED_DIR, "generated");
const OUT = join(SEED_DIR, "content.json");

const PUBLISHERS: PublisherSeed[] = [
  { slug: "dc", name: "DC Comics", color_hex: "#0476D0", logo_url: "/publishers/dc.svg" },
  { slug: "marvel", name: "Marvel Comics", color_hex: "#E62429", logo_url: "/publishers/marvel.svg" },
  { slug: "image", name: "Image Comics", color_hex: "#1DB954", logo_url: "/publishers/image.svg" },
  { slug: "boom", name: "BOOM! Studios", color_hex: "#FF6B35", logo_url: "/publishers/boom.svg" },
];

interface GeneratedFile {
  primary: EntitySeed;
  supporting?: EntitySeed[];
}

// Role assignment for entities authored before the `role` field existed.
// Entities whose JSON already sets `role` (e.g. the Image/BOOM additions) keep it.
const ROLE_OVERRIDES: Record<string, EntitySeed["role"]> = {
  wolverine: "antihero",
  spawn: "antihero",
  "the-empty-man": "villain",
};
// The seeded rogues galleries — these become the "Villains" filter.
const VILLAIN_SLUGS = new Set<string>([
  // DC
  "joker", "bane", "ra-s-al-ghul", "two-face", "lex-luthor", "brainiac", "general-zod",
  "doomsday", "ares", "cheetah", "circe", "doctor-poison", "reverse-flash", "captain-cold",
  "gorilla-grodd", "zoom", "sinestro", "parallax", "atrocitus", "hector-hammond", "darkseid",
  "starro", "deathstroke", "trigon", "brother-blood", "terra",
  // Marvel
  "green-goblin", "doctor-octopus", "venom", "sandman", "mandarin", "obadiah-stane", "whiplash",
  "ultron", "red-skull", "baron-zemo", "crossbones", "arnim-zola", "loki", "hela", "malekith",
  "surtur", "sabretooth", "omega-red", "lady-deathstrike", "mister-sinister", "magneto",
  "apocalypse", "mystique", "kang",
]);

function roleFor(slug: string): EntitySeed["role"] {
  return ROLE_OVERRIDES[slug] ?? (VILLAIN_SLUGS.has(slug) ? "villain" : "hero");
}

function normalizeEntity(e: EntitySeed): EntitySeed {
  return {
    ...e,
    role: e.role ?? roleFor(e.slug),
    logo_url: e.logo_url ?? null,
    cover_image_url: e.cover_image_url ?? null,
    eras: (e.eras ?? []).map((era) => ({
      ...era,
      arcs: (era.arcs ?? []).map((arc) => ({
        ...arc,
        spoiler: arc.spoiler ?? null,
        reading_entries: arc.reading_entries ?? [],
      })),
    })),
    start_here: e.start_here ?? [],
    relationships: e.relationships ?? [],
    media: e.media ?? [],
    team_members: e.team_members ?? undefined,
  };
}

function main() {
  const files = readdirSync(GENERATED_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Reading ${files.length} generated files…`);

  // slug -> entity, with provenance so primaries win over supporting.
  const bySlug = new Map<string, { entity: EntitySeed; isPrimary: boolean; source: string }>();

  const add = (entity: EntitySeed, isPrimary: boolean, source: string) => {
    const existing = bySlug.get(entity.slug);
    if (!existing) {
      bySlug.set(entity.slug, { entity: normalizeEntity(entity), isPrimary, source });
      return;
    }
    // Upgrade supporting -> primary if a primary definition appears.
    if (isPrimary && !existing.isPrimary) {
      bySlug.set(entity.slug, { entity: normalizeEntity(entity), isPrimary, source });
    }
  };

  for (const file of files) {
    const raw = readFileSync(join(GENERATED_DIR, file), "utf8");
    let parsed: GeneratedFile;
    try {
      parsed = JSON.parse(raw) as GeneratedFile;
    } catch (err) {
      console.error(`  ✗ ${file}: invalid JSON — ${(err as Error).message}`);
      process.exitCode = 1;
      continue;
    }
    if (!parsed.primary?.slug) {
      console.error(`  ✗ ${file}: missing primary.slug`);
      process.exitCode = 1;
      continue;
    }
    add(parsed.primary, true, file);
    for (const s of parsed.supporting ?? []) {
      if (s?.slug) add(s, false, file);
    }
  }

  const entities = [...bySlug.values()].map((v) => v.entity);
  const slugSet = new Set(entities.map((e) => e.slug));

  // ---- Reference validation -------------------------------------------------
  let danglingRel = 0;
  let danglingMember = 0;
  let danglingArc = 0;
  for (const e of entities) {
    const ownArcSlugs = new Set(e.eras.flatMap((era) => era.arcs.map((a) => a.slug)));
    for (const r of e.relationships) {
      if (!slugSet.has(r.related_slug)) {
        danglingRel++;
        console.warn(`  ! ${e.slug}: relationship -> unknown entity '${r.related_slug}' (${r.relationship})`);
      }
    }
    for (const tm of e.team_members ?? []) {
      if (!slugSet.has(tm.character_slug)) {
        danglingMember++;
        console.warn(`  ! ${e.slug}: team member -> unknown character '${tm.character_slug}'`);
      }
    }
    for (const sh of e.start_here) {
      if (!ownArcSlugs.has(sh.arc_slug)) {
        danglingArc++;
        console.warn(`  ! ${e.slug}: start_here -> unknown arc '${sh.arc_slug}'`);
      }
    }
  }

  // ---- Stats ----------------------------------------------------------------
  const characters = entities.filter((e) => e.entity_type === "character").length;
  const teams = entities.filter((e) => e.entity_type === "team").length;
  const eras = entities.reduce((n, e) => n + e.eras.length, 0);
  const arcs = entities.reduce((n, e) => n + e.eras.reduce((m, era) => m + era.arcs.length, 0), 0);
  const reading = entities.reduce(
    (n, e) => n + e.eras.reduce((m, era) => m + era.arcs.reduce((k, a) => k + a.reading_entries.length, 0), 0),
    0,
  );
  const rels = entities.reduce((n, e) => n + e.relationships.length, 0);
  const media = entities.reduce((n, e) => n + e.media.length, 0);
  const members = entities.reduce((n, e) => n + (e.team_members?.length ?? 0), 0);

  entities.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(OUT, JSON.stringify({ publishers: PUBLISHERS, entities }, null, 2) + "\n", "utf8");

  console.log("\n── Assembled ──────────────────────────────");
  console.log(`  entities         ${entities.length}  (${characters} characters, ${teams} teams)`);
  console.log(`  eras             ${eras}`);
  console.log(`  arcs             ${arcs}`);
  console.log(`  reading entries  ${reading}`);
  console.log(`  relationships    ${rels}`);
  console.log(`  team members     ${members}`);
  console.log(`  media entries    ${media}`);
  console.log(`  dangling refs    rel:${danglingRel} member:${danglingMember} arc:${danglingArc}`);
  console.log(`\n  → ${OUT}`);
}

main();
