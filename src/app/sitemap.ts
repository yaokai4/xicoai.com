import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { localeAlternates } from "@/lib/i18n-meta";

/** Path → crawl priority. Product pages are weighted above company pages so
 * search engines spend their budget where it converts. */
const PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, freq: "weekly" },
  { path: "/mac", priority: 0.95, freq: "weekly" },
  { path: "/mac/features", priority: 0.85, freq: "monthly" },
  { path: "/mac/pricing", priority: 0.85, freq: "weekly" },
  { path: "/mac/buy", priority: 0.8, freq: "weekly" },
  { path: "/mac/security", priority: 0.75, freq: "monthly" },
  { path: "/mac/support", priority: 0.7, freq: "monthly" },
  { path: "/about", priority: 0.6, freq: "monthly" },
  { path: "/services", priority: 0.6, freq: "monthly" },
  { path: "/blog", priority: 0.6, freq: "weekly" },
  { path: "/careers", priority: 0.5, freq: "monthly" },
  { path: "/join", priority: 0.5, freq: "monthly" },
  { path: "/contact", priority: 0.5, freq: "monthly" },
];

/** Absolute URL for a locale + path (default locale has no prefix). */
function abs(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${site.url}${prefix}${path}` || site.url;
}

/** Captured once at module load (= build / server-start time), NOT per request.
 * `new Date()` inside the handler stamps every URL "modified now" on every crawl,
 * which Google treats as a false freshness signal and discounts. A stable
 * per-deploy timestamp is honest: the sitemap reflects the currently-deployed build. */
const BUILD_TIME = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = BUILD_TIME;

  for (const { path, priority, freq } of PATHS) {
    // One hreflang map per path, reused across every locale's entry so each
    // localized URL advertises all its language alternates + x-default.
    const rel = localeAlternates(path);
    const languages: Record<string, string> = {};
    for (const [hreflang, relPath] of Object.entries(rel)) {
      languages[hreflang] = `${site.url}${relPath === "/" ? "" : relPath}` || site.url;
    }

    for (const locale of routing.locales) {
      entries.push({
        url: abs(locale, path),
        lastModified: now,
        changeFrequency: freq,
        priority,
        alternates: { languages },
      });
    }
  }

  return entries;
}
