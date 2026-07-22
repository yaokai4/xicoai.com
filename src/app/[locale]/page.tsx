import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Capabilities } from "@/components/sections/capabilities";
import { Approach } from "@/components/sections/approach";
import { Work } from "@/components/sections/work";
import { Process } from "@/components/sections/process";
import { Manifesto } from "@/components/sections/manifesto";
import { Faq } from "@/components/sections/faq";
import { CTA } from "@/components/sections/cta";
import { Divider } from "@/components/ui/section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Homepage FAQ → FAQPage JSON-LD: structured Q&A the site already shows,
  // now machine-readable for AI answer engines (Google's SERP FAQ UI is gone,
  // but the markup still feeds AI Overviews / ChatGPT / Perplexity citations).
  const tf = await getTranslations({ locale, namespace: "faq" });
  const faqNodes = faqJsonLd(tf.raw("items") as { q: string; a: string }[]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqNodes) }}
      />
      <Hero />
      <Marquee />
      <Work />
      <Divider />
      <Capabilities />
      <Approach />
      <Process />
      <Manifesto />
      <Faq />
      <CTA />
    </>
  );
}
