// =============================================================================
// Validate researched seed bundles in lib/data/seed/incoming/ (report only).
// -----------------------------------------------------------------------------
// Reports schema / enum / count / slug / cross-reference issues for each dropped
// file WITHOUT modifying anything. Run before ingesting to review a batch.
//
// Run with:  npm run seed:validate    (exit code non-zero if any ERRORS)
// =============================================================================

import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isStr, normalizeBundle, validateBundle, type Bundle } from "./seed-lib";

const ROOT = process.cwd();
const INCOMING = join(ROOT, "lib", "data", "seed", "incoming");
const CONTENT = join(ROOT, "lib", "data", "seed", "content.json");

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
    console.log(`${YEL}Warning: could not read content.json; cross-refs to existing entities won't resolve.${RST}`);
  }
  return set;
}

function main() {
  if (!existsSync(INCOMING)) mkdirSync(INCOMING, { recursive: true });
  const files = readdirSync(INCOMING).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log(`${DIM}No .json files in lib/data/seed/incoming/. Drop researched bundles there and re-run.${RST}`);
    return;
  }

  const existing = existingSlugs();
  const parsed: { file: string; bundle: Bundle }[] = [];
  const incoming = new Set<string>();
  let totalErrors = 0;
  let totalWarns = 0;

  // Parse + normalize (in-memory only) so cross-refs resolve as they will post-ingest.
  for (const file of files.sort()) {
    try {
      const bundle = normalizeBundle(JSON.parse(readFileSync(join(INCOMING, file), "utf8")));
      parsed.push({ file, bundle });
      for (const e of [bundle.primary, ...bundle.supporting]) if (isStr(e?.slug)) incoming.add(e.slug);
    } catch (e) {
      console.log(`${RED}✗ ${file}: invalid JSON — ${(e as Error).message}${RST}`);
      totalErrors++;
    }
  }

  const known = new Set<string>([...existing, ...incoming]);

  for (const { file, bundle } of parsed) {
    const issues = validateBundle(bundle, known);
    const errs = issues.filter((i) => i.level === "error");
    const warns = issues.filter((i) => i.level === "warn");
    totalErrors += errs.length;
    totalWarns += warns.length;
    const mark = errs.length ? `${RED}✗` : warns.length ? `${YEL}▲` : `${GRN}✓`;
    console.log(`\n${mark} ${file}${RST} ${DIM}— primary "${bundle.primary?.slug}", ${bundle.supporting.length} supporting${RST}`);
    for (const i of errs) console.log(`   ${RED}error${RST}  ${i.where}: ${i.msg}`);
    for (const i of warns) console.log(`   ${YEL}warn ${RST}  ${i.where}: ${i.msg}`);
  }

  const collisions = [...incoming].filter((s) => existing.has(s));
  if (collisions.length) {
    console.log(`\n${DIM}Note: ${collisions.length} slug(s) already exist in the live library (will replace/de-dupe on ingest): ${collisions.slice(0, 12).join(", ")}${collisions.length > 12 ? "…" : ""}${RST}`);
  }
  console.log(`\n${totalErrors ? RED : GRN}── ${files.length} file(s): ${totalErrors} error(s), ${totalWarns} warning(s) ──${RST}`);
  if (totalErrors > 0) process.exitCode = 1;
}

main();
