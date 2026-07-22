import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container, Eyebrow } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { buttonClass, ArrowIcon } from "@/components/ui/button";
import { site, productUrls } from "@/lib/site";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="border-gradient relative overflow-hidden rounded-[2rem] border border-border bg-surface/40 px-8 py-16 text-center sm:px-16 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-72 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[100px]"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 40%, transparent), transparent 70%)",
              }}
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {t("subtitle")}
              </p>
              <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                <Link href="/mac" className={buttonClass("primary", "w-full sm:w-auto")}>
                  {t("button")}
                  <ArrowIcon />
                </Link>
                <a
                  href={productUrls.machi}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("secondary", "w-full sm:w-auto")}
                >
                  {t("buttonSecondary")}
                </a>
              </div>
              <a
                href={`mailto:${site.email}`}
                className="interactive-link mt-6 break-all text-center text-sm text-muted transition-colors hover:text-foreground sm:break-normal"
              >
                {t("emailLabel")} · {site.email}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
