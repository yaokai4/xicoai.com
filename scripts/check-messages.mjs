#!/usr/bin/env node
/**
 * Verifies the 11 locale files in messages/ expose exactly the same key
 * structure (including array lengths and per-element object shapes), so no
 * language can silently miss a key the UI reads.
 *
 * Usage: node scripts/check-messages.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();

if (files.length === 0) {
  console.error("No message files found in", dir);
  process.exit(1);
}

/** Flatten to structural paths: objects by key, arrays by index. */
function paths(value, prefix, out) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => paths(v, `${prefix}[${i}]`, out));
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      paths(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else {
    out.add(prefix);
    if (typeof value === "string" && value.trim() === "") {
      out.add(`${prefix} <EMPTY STRING>`);
    }
  }
  return out;
}

const sets = new Map();
for (const f of files) {
  const data = JSON.parse(readFileSync(join(dir, f), "utf8"));
  sets.set(f, paths(data, "", new Set()));
}

const [refFile] = files;
const ref = sets.get(refFile);
let ok = true;

for (const f of files.slice(1)) {
  const s = sets.get(f);
  const missing = [...ref].filter((p) => !s.has(p));
  const extra = [...s].filter((p) => !ref.has(p));
  if (missing.length || extra.length) {
    ok = false;
    console.error(`\n✗ ${f} differs from ${refFile}:`);
    for (const p of missing.slice(0, 20)) console.error(`   missing: ${p}`);
    if (missing.length > 20) console.error(`   … ${missing.length - 20} more missing`);
    for (const p of extra.slice(0, 20)) console.error(`   extra:   ${p}`);
    if (extra.length > 20) console.error(`   … ${extra.length - 20} more extra`);
  }
}

if (ok) {
  console.log(`✓ ${files.length} locale files share an identical key structure (${ref.size} leaf keys).`);
} else {
  process.exit(1);
}
