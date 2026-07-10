import { getTranslations, getLocale } from "next-intl/server";
import { Mark } from "@/components/brand/logo";
import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

export async function MacFooter() {
  const t = await getTranslations("mac.footer");
  const tn = await getTranslations("mac");
  const tf = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();
  const prefix = locale === "zh" ? "" : `/${locale}`;

  const productLinks = [
    { label: t("links.features"), href: "#features" },
    { label: t("links.safety"), href: "#safety" },
    { label: t("links.privacy"), href: "#privacy" },
    { label: t("links.pricing"), href: "#pricing" },
    { label: t("links.faq"), href: "#faq" },
    { label: t("links.waitlist"), href: "#waitlist" },
  ];

  const companyLinks = [
    { label: t("links.company"), href: `${site.url}${prefix}` },
    { label: t("links.privacyPolicy"), href: `${site.url}${prefix}/privacy` },
    { label: t("links.terms"), href: `${site.url}${prefix}/terms` },
  ];

  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-xs">
            <span className="inline-flex items-center gap-2">
              <Mark size={24} />
              <span className="font-display text-[1.15rem] font-semibold tracking-tight text-foreground">
                {tn("productName")}
              </span>
            </span>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t("tagline")}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/30 px-2.5 py-1 text-[11px] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
              {tn("badge")}
            </span>
          </div>

          <FooterGroup title={t("productGroup")}>
            {productLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </FooterGroup>

          <FooterGroup title={t("companyGroup")}>
            {companyLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </FooterGroup>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p>
              © {year} XICO AI. {t("by")}
            </p>
            <p className="text-faint/70">{site.fullName[locale]}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-muted"
            >
              {tf("icp")}
            </a>
            <span className="text-faint/60">mac.xicoai.com</span>
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
