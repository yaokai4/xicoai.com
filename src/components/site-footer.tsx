import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo, wordmarkFor } from "@/components/brand/logo";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();

  const companyLinks = [
    { label: t("links.about"), href: "/about" },
    { label: t("links.work"), href: "/#work" },
    { label: t("links.services"), href: "/services" },
    { label: t("links.careers"), href: "/careers" },
    { label: t("links.join"), href: "/join" },
    { label: t("links.contact"), href: "/contact" },
  ];

  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo wordmark={wordmarkFor(locale)} />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t("tagline")}
            </p>
          </div>

          <FooterGroup title={t("groups.company")}>
            {companyLinks.map((l) => (
              <FooterLink key={l.href} href={l.href}>
                {l.label}
              </FooterLink>
            ))}
          </FooterGroup>

          <FooterGroup title={t("groups.products")}>
            <FooterLink href="/#work">{t("links.machi")}</FooterLink>
            <FooterLink href="/#work">{t("links.shangence")}</FooterLink>
            <span className="text-sm text-faint">{t("comingSoon")}</span>
          </FooterGroup>

          <FooterGroup title={t("groups.connect")}>
            <a
              href={`mailto:${site.email}`}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {site.email}
            </a>
            <span className="text-sm text-muted">{t("links.location")}</span>
          </FooterGroup>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.fullName[locale]}. {t("rights")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-muted"
            >
              {t("icp")}
            </a>
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
