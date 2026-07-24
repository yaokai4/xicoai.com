import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, wordmarkFor } from "@/components/brand/logo";
import { SocialLinks } from "@/components/social-links";
import { getSocialLinks } from "@/lib/settings";
import { site, productUrls, registration } from "@/lib/site";
import { businessLicenseImage } from "@/lib/legal";
import type { Locale } from "@/i18n/routing";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const socialLinks = await getSocialLinks();
  const year = new Date().getFullYear();

  const companyLinks = [
    { label: t("links.about"), href: "/about" },
    { label: t("links.work"), href: "/work" },
    { label: t("links.services"), href: "/services" },
    { label: t("links.careers"), href: "/careers" },
    { label: t("links.join"), href: "/join" },
    { label: t("links.contact"), href: "/contact" },
  ];

  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo wordmark={wordmarkFor(locale)} />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t("tagline")}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 inline-block text-sm text-muted transition-colors hover:text-foreground"
            >
              {site.email}
            </a>
            <SocialLinks links={socialLinks} className="mt-6" />
          </div>

          <FooterGroup title={t("groups.products")}>
            <FooterLink href="/mac">{t("links.xicoclean")}</FooterLink>
            <a
              href={productUrls.machi}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t("links.machi")}
            </a>
            <a
              href={productUrls.shangence}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t("links.shangence")}
            </a>
            <span className="text-sm text-faint">{t("comingSoon")}</span>
          </FooterGroup>

          <FooterGroup title={t("groups.company")}>
            {companyLinks.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterGroup>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <p>© {year} XICO AI. {t("rights")}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-faint/70">
              <span>{site.fullName[locale]}</span>
              <span aria-hidden className="text-faint/40">·</span>
              <a
                href={registration.verifyUrl}
                target="_blank"
                rel="noreferrer"
                title={t("creditCodeVerify")}
                className="tabular-nums transition-colors hover:text-muted"
              >
                {t("creditCodeLabel")} {registration.creditCode}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <FooterLink href="/privacy">{t("links.privacy")}</FooterLink>
            <FooterLink href="/terms">{t("links.terms")}</FooterLink>
            {businessLicenseImage && (
              <a
                href={businessLicenseImage}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-muted"
              >
                {t("license")}
              </a>
            )}
            <span className="text-faint/60">{site.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
        {title}
      </h3>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-muted transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
