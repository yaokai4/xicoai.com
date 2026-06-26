import { setRequestLocale } from "next-intl/server";
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

  return (
    <>
      <Hero />
      <Marquee />
      <Capabilities />
      <Approach />
      <Divider />
      <Work />
      <Process />
      <Manifesto />
      <Faq />
      <CTA />
    </>
  );
}
