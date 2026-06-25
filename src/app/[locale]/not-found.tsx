"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mark } from "@/components/brand/logo";
import { Container } from "@/components/ui/section";
import { buttonClass, ArrowIcon } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <section className="relative flex min-h-[82vh] items-center overflow-hidden py-24">
      <Container>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <Mark size={40} className="[filter:drop-shadow(0_6px_22px_rgba(124,140,255,0.4))]" />
          <p className="mt-8 font-display text-[5.5rem] font-semibold leading-none tracking-tight text-gradient sm:text-[8rem]">
            404
          </p>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-muted text-pretty">
            {t("desc")}
          </p>
          <Link href="/" className={buttonClass("primary", "mt-9")}>
            {t("home")}
            <ArrowIcon />
          </Link>
        </div>
      </Container>
    </section>
  );
}
