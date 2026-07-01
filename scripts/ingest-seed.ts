// =============================================================================
// Ingest researched seed bundles: standardize → validate → promote → archive.
// -----------------------------------------------------------------------------
// Picks up every fresh *.json in lib/data/seed/incoming/, standardizes it
// (canonical slugs incl. aliases, null images, trimmed text), validates it, and
// — only if clean — writes the canonical file to lib/data/seed/generated/<slug>.json
// and moves the raw research file into incoming/_processed/. Files with errors
// are left in place and reported so they can be fixed.
//
// The npm `seed:ingest` script then runs assemble + sql to compact everything
// into the live dataset (content.json) and regenerate seed.sql.
//
// Run with:  npm run seed:ingest
// =============================================================================

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bundleSlugs, isStr, normalizeBundle, validateBundle, type Bundle } from "./seed-lib";

const ROOT = process.cwd();
const SEED = join(ROOT, "lib", "data", "seed");
const INCOMING = join(SEED, "incoming");
const PROCESSED = join(INCOMING, "_processed");
const GENERATED = join(SEED, "generated");
const CONTENT = join(SEED, "content.json");

const RED = "\x1b[31m";
const YEL = "\x1b[33m";
const GRN = "\x1b[32m";
const DIM = "\x1b[2m";
const RST = "\x1b[0m";

function existingSlugs(): Set<string> {
  const set = new Set<string>();
  if (!existsSync(CONTENT)) return set;
  try {
    const content = JSON.parse(readFileSync(CONTENT, "utf8")) as { entities?: { slug?: string }[] };
    for (const en of content.entities ?? []) if (isStr(en?.slug)) set.add(en.slug);
  } catch {
    /* ignore — refs to existing entities just won't resolve */
  }
  return set;
}

function main() {
  if (!existsSync(INCOMING)) {
    console.log("No incoming/ folder — nothing to ingest.");
    return;
  }
  const files = readdirSync(INCOMING).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log(`${DIM}No fresh .json files in incoming/. Nothing to ingest.${RST}`);
    return;
  }
  if (!existsSync(GENERATED)) mkdirSync(GENERATED, { recursive: true });
  if (!existsSync(PROCESSED)) mkdirSync(PROCESSED, { recursive: true });

  // Pass 1: parse + standardize every file, collect all slugs so intra-batch
  // and cross-batch references resolve.
  const staged: { file: string; bundle: Bundle }[] = [];
  const incomingSlugs = new Set<string>();
  let parseErrors = 0;

  for (const file of files.sort()) {
    try {
      const bundle = normalizeBundle(JSON.parse(readFileSync(join(INCOMING, file), "utf8")));
      staged.push({ file, bundle });
      for (const s of bundleSlugs(bundle)) incomingSlugs.add(s);
    } catch (e) {
      console.log(`${RED}✗ ${file}: invalid JSON — ${(e as Error).message} (left in incoming/)${RST}`);
      parseErrors++;
    }
  }

  const known = new Set<string>([...existingSlugs(), ...incomingSlugs]);

  // Pass 2: validate + promote the clean ones.
  let promoted = 0;
  let rejected = parseErrors;

  for (const { file, bundle } of staged) {
    const issues = validateBundle(bundle, known);
    const errs = issues.filter((i) => i.level === "error");
    const warns = issues.filter((i) => i.level === "warn");

    if (errs.length > 0) {
      console.log(`\n${RED}✗ ${file}${RST} ${DIM}— ${errs.length} error(s); left in incoming/ to fix${RST}`);
      for (const i of errs) console.log(`   ${RED}error${RST}  ${i.where}: ${i.msg}`);
      rejected++;
      continue;
    }

    const slug = bundle.primary.slug;
    const outName = `${slug}.json`;
    const replacing = existsSync(join(GENERATED, outName));
    writeFileSync(join(GENERATED, outName), JSON.stringify(bundle, null, 2) + "\n", "utf8");
    renameSync(join(INCOMING, file), join(PROCESSED, file));

    const tag = replacing ? `${YEL}replaced${RST}` : `${GRN}added${RST}`;
    console.log(
      `\n${GRN}✓ ${file}${RST} → ${tag} generated/${outName} ${DIM}(${bundle.supporting.length} supporting; raw archived)${RST}`,
    );
    for (const i of warns) console.log(`   ${YEL}warn ${RST}  ${i.where}: ${i.msg}`);
    promoted++;
  }

  console.log(
    `\n${rejected ? YEL : GRN}── ingested ${promoted} file(s)${rejected ? `, ${rejected} left to fix` : ""} ──${RST}`,
  );
  if (promoted === 0) {
    console.log(`${DIM}Nothing promoted — assemble/sql steps will be a no-op rebuild.${RST}`);
  }
}

main();
