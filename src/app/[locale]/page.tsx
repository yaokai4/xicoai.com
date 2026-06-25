import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Capabilities } from "@/components/sections/capabilities";
import { Work } from "@/components/sections/work";
import { Approach } from "@/components/sections/approach";
import { CTA } from "@/components/sections/cta";
import { Divider } from "@/components/ui/section";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Marquee />
      <Capabilities />
      <Divider />
      <Work />
      <Approach />
      <CTA />
    </>
  );
}
