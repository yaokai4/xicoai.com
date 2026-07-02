import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

const PATHS = [
  "",
  "/mac",
  "/mac/features",
  "/mac/security",
  "/mac/pricing",
  "/mac/support",
  "/about",
  "/services",
  "/blog",
  "/careers",
  "/join",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    for (const path of PATHS) {
      entries.push({
        url: `${site.url}${prefix}${path}` || site.url,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
