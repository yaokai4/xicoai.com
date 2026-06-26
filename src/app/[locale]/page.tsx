import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Capabilities } from "@/components/sections/capabilities";
import { Work } from "@/components/sections/work";
import { Manifesto } from "@/components/sections/manifesto";
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
      <Manifesto />
      <CTA />
    </>
  );
}
