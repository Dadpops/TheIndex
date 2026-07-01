// =============================================================================
// Generate supabase/seed.sql from the built dataset.
// -----------------------------------------------------------------------------
// Emits idempotent INSERTs (ON CONFLICT (id) DO NOTHING) in foreign-key order,
// using the same deterministic UUIDs the offline app uses — so the local seed
// and the Supabase database are byte-for-byte the same records.
//
// Run with:  npm run seed:sql   (i.e. npx tsx scripts/generate-seed-sql.ts)
// Then paste supabase/seed.sql into the Supabase SQL editor (after migrations).
// =============================================================================

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildDataset } from "../lib/data/seed/build";

type Val = string | number | boolean | null | undefined;

function sql(v: Val): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${v.replace(/'/g, "''")}'`;
}

function insert<T>(table: string, columns: (keyof T)[], rows: T[]): string {
  if (rows.length === 0) return `-- (no rows for ${table})\n`;
  const cols = columns.map((c) => `"${String(c)}"`).join(", ");
  const values = rows
    .map((row) => `  (${columns.map((c) => sql(row[c] as Val)).join(", ")})`)
    .join(",\n");
  return `insert into ${table} (${cols}) values\n${values}\non conflict (id) do nothing;\n`;
}

function main() {
  const d = buildDataset();
  const out: string[] = [
    "-- =============================================================================",
    "-- The Index — seed data (GENERATED — do not edit by hand).",
    "-- Regenerate with: npm run seed:sql",
    "-- Apply after supabase/migrations/0001_init.sql.",
    "-- =============================================================================",
    "begin;",
    "",
  ];

  out.push("-- publishers");
  out.push(insert("publishers", ["id", "slug", "name", "color_hex", "logo_url", "created_at"], d.publishers));
  out.push("-- entities");
  out.push(
    insert(
      "entities",
      ["id", "slug", "name", "entity_type", "role", "publisher_id", "real_name", "first_appearance", "logo_url", "cover_image_url", "short_bio", "created_at"],
      d.entities,
    ),
  );
  out.push("-- eras");
  out.push(
    insert("eras", ["id", "entity_id", "slug", "title", "start_year", "end_year", "order_index", "summary", "created_at"], d.eras),
  );
  out.push("-- arcs");
  out.push(
    insert(
      "arcs",
      ["id", "era_id", "slug", "title", "logline", "summary", "spoiler", "arc_type", "start_year", "end_year", "order_index", "created_at"],
      d.arcs,
    ),
  );
  out.push("-- reading_entries");
  out.push(
    insert(
      "reading_entries",
      ["id", "arc_id", "title", "format", "issue_range", "reading_order", "publication_order", "reading_order_note", "isbn", "purchase_url", "created_at"],
      d.readingEntries,
    ),
  );
  out.push("-- start_here");
  out.push(insert("start_here", ["id", "entity_id", "arc_id", "order_index", "label", "reason"], d.startHere));
  out.push("-- relationships");
  out.push(insert("relationships", ["id", "entity_id", "related_id", "relationship", "summary", "notes"], d.relationships));
  out.push("-- media_entries");
  out.push(
    insert(
      "media_entries",
      ["id", "entity_id", "media_type", "title", "release_year", "watch_order", "platform", "notes", "where_to_watch"],
      d.media,
    ),
  );
  out.push("-- team_members");
  out.push(insert("team_members", ["id", "team_id", "character_id", "era_id", "role", "notes"], d.teamMembers));

  out.push("", "commit;", "");

  const target = join(process.cwd(), "supabase", "seed.sql");
  writeFileSync(target, out.join("\n"), "utf8");

  const total =
    d.publishers.length + d.entities.length + d.eras.length + d.arcs.length + d.readingEntries.length +
    d.startHere.length + d.relationships.length + d.media.length + d.teamMembers.length;
  console.log(`Wrote ${total} rows across 9 tables → supabase/seed.sql`);
}

main();
