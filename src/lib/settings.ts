import "server-only";
import { getDb } from "@/db";
import { settings } from "@/db/schema";

/** All settings as a key→value map (empty values dropped). */
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await getDb().select().from(settings);
    const map: Record<string, string> = {};
    for (const r of rows) if (r.value) map[r.key] = r.value;
    return map;
  } catch (e) {
    console.error("getSettings failed", e);
    return {};
  }
}

/** Social links as platformKey→url, dropping empties. */
export async function getSocialLinks(): Promise<Record<string, string>> {
  const all = await getSettings();
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith("social_") && v) out[k.slice("social_".length)] = v;
  }
  return out;
}
