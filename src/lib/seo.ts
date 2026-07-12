/**
 * JSON-LD structured-data builders for Xico Clean & XICO AI.
 *
 * Schema.org markup is one of the highest-leverage SEO levers for a global
 * product: it lets Google render rich results (app card with price/rating,
 * FAQ accordions, breadcrumb trails) and feeds AI answer engines a clean,
 * machine-readable description of the product in every language.
 *
 * Pure module (no server imports) so it can run in any server component. We
 * deliberately DO NOT emit a fabricated `aggregateRating` — inventing reviews
 * violates Google's structured-data policy and risks a manual penalty. Add it
 * only when real, verifiable ratings exist.
 */

import { site } from "@/lib/site";

/** Single source of truth for the shipped app version (keep in sync on release).
 *  Used by SoftwareApplication JSON-LD so structured data never goes stale. */
export const APP_VERSION = "0.4.0";

/** Absolute URL for a locale-prefixed path (default locale has no prefix). */
export function absoluteUrl(path: string, localePrefix = ""): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${site.url}${localePrefix}${clean === "/" ? "" : clean}` || site.url;
}

/** The product's display name per locale — Chinese markets use 希可Mac清理,
 *  everyone else keeps the Latin brand "Xico Clean". Single source of truth for
 *  every server-rendered wordmark, siteName, breadcrumb and structured-data name. */
export function productName(locale: string): string {
  return locale === "zh" || locale === "zh-Hant" ? "希可Mac清理" : "Xico Clean";
}

/** BCP-47 tag Google prefers, per site locale. */
const INLANG: Record<string, string> = {
  zh: "zh-Hans",
  "zh-Hant": "zh-Hant",
  ja: "ja",
  en: "en",
  ko: "ko",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  pt: "pt-BR",
  ru: "ru",
};

export function inLanguage(locale: string): string {
  return INLANG[locale] ?? locale;
}

/** The publisher Organization — referenced by @id from every other node. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: "XICO AI",
    legalName: site.fullName.en,
    alternateName: ["智希可", "XICO", "Xico"],
    url: site.url,
    email: site.email,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/icon.svg`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: site.email,
      contactType: "customer support",
      availableLanguage: [
        "en", "zh-Hans", "zh-Hant", "ja", "ko",
        "de", "es", "fr", "it", "pt", "ru",
      ],
    },
    // Topical + geographic entity signals: help search + AI resolve "XICO AI"
    // as a software/AI development company and its area of expertise.
    knowsAbout: [
      "Software product development",
      "AI application development",
      "Web and mobile app development",
      "Mac software development",
      "Digital platform engineering",
    ],
    areaServed: "Worldwide",
    foundingLocation: {
      "@type": "Place",
      name: "Changsha, China",
    },
    // Real, verifiable presences that resolve the "XICO AI / Xico" entity for
    // search + AI answer engines (public code repo + sibling product sites).
    sameAs: [
      "https://github.com/yaokai4",
      "https://mac.xicoai.com",
      "https://machicity.com",
      "https://shangence.com",
    ],
  };
}

/** The WebSite node — anchors the domain and its name in search. */
export function webSiteJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: "XICO AI｜智希可",
    url: site.url,
    inLanguage: inLanguage(locale),
    publisher: { "@id": `${site.url}/#organization` },
  };
}

export type AppOffer = {
  priceCurrency: string;
  /** Lowest sellable plan price in major units (e.g. 5.99). */
  lowPrice: number;
  /** Highest sellable plan price in major units. */
  highPrice: number;
  offerCount: number;
  available: boolean;
};

/**
 * The SoftwareApplication node — the app card Google can show with an OS,
 * category, feature list, screenshots and price. `featureList` and
 * `screenshot` are strong topical signals; both come from the real product.
 */
export function softwareAppJsonLd(opts: {
  locale: string;
  description: string;
  featureList: string[];
  offer?: AppOffer | null;
  screenshots?: string[];
}) {
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${site.url}/mac#software`,
    name: productName(opts.locale),
    alternateName: ["Xico Clean", "希可Mac清理", "希可清理", "Xico Mac Cleaner", "智希可清理"],
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Mac Cleaner",
    operatingSystem: "macOS 13.0 or later",
    processorRequirements: "Apple silicon or Intel (Universal)",
    softwareVersion: APP_VERSION,
    description: opts.description,
    inLanguage: inLanguage(opts.locale),
    url: `${site.url}/mac`,
    downloadUrl: `${site.url}/api/download/xico-clean`,
    installUrl: `${site.url}/mac`,
    featureList: opts.featureList,
    author: { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
    isAccessibleForFree: false,
  };

  if (opts.screenshots?.length) {
    node.screenshot = opts.screenshots.map((s) => ({
      "@type": "ImageObject",
      url: s.startsWith("http") ? s : `${site.url}${s}`,
    }));
  }

  if (opts.offer) {
    const { priceCurrency, lowPrice, highPrice, offerCount, available } =
      opts.offer;
    node.offers = {
      "@type": "AggregateOffer",
      priceCurrency,
      lowPrice: String(lowPrice),
      highPrice: String(highPrice),
      offerCount,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    };
  }

  return node;
}

/** FAQPage — Google can surface these as an expandable Q&A block in results. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

/**
 * BreadcrumbList — renders the crumb trail in the SERP and clarifies site
 * hierarchy. `trail` items are already-absolute URLs.
 */
export function breadcrumbJsonLd(trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.url,
    })),
  };
}

/** Serialize one or more nodes into a single <script> payload. */
export function jsonLdScript(nodes: unknown | unknown[]): string {
  return JSON.stringify(Array.isArray(nodes) ? nodes : [nodes]);
}
