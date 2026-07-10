import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Keep private/app surfaces out of the index; everything else is crawlable.
  const disallow = ["/admin", "/webmail", "/api/"];
  return {
    rules: [
      // Search + AI answer engines: explicitly welcome. AI-answer citations
      // (Google AI Overviews, ChatGPT, Perplexity, Claude) are a growing
      // discovery channel, so we deliberately do NOT block their crawlers.
      { userAgent: "*", allow: "/", disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
