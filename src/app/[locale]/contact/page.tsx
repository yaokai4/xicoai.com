import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";
import { pageAlternates } from "@/lib/i18n-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("contact"),
    alternates: pageAlternates("/contact", locale),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("contact");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <Reveal>
              <div className="rounded-3xl border border-border bg-surface/40 p-8 sm:p-10">
                <ContactForm />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-col gap-8">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {t("direct.title")}
                </h2>
                <InfoRow label={t("direct.emailLabel")}>
                  <a
                    href={`mailto:${site.email}`}
                    className="text-foreground transition-colors hover:text-accent"
                  >
                    {site.email}
                  </a>
                </InfoRow>
                <InfoRow label={t("direct.locationLabel")}>
                  <span className="text-foreground">{t("direct.location")}</span>
                </InfoRow>
                <InfoRow label="Web">
                  <span className="text-foreground">{site.domain}</span>
                </InfoRow>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-5">
      <span className="text-xs uppercase tracking-wider text-faint">
        {label}
      </span>
      <div className="text-base">{children}</div>
    </div>
  );
}
