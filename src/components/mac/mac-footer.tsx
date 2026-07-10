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

  /* Anchors point into the /mac one-pager; deep pages keep their own URLs. */
  const productLinks = [
    { label: t("links.features"), href: `${prefix}/mac#features` },
    { label: t("links.safety"), href: `${prefix}/mac#safety` },
    { label: t("links.pricing"), href: `${prefix}/mac#pricing` },
    { label: t("links.faq"), href: `${prefix}/mac#faq` },
    { label: tn("nav.download"), href: `${prefix}/mac#download` },
    { label: tn("nav.support"), href: `${prefix}/mac/support` },
  ];

  const companyLinks = [
    { label: t("links.company"), href: `${site.url}${prefix}` },
    { label: t("links.privacyPolicy"), href: `${site.url}${prefix}/privacy` },
    { label: t("links.terms"), href: `${site.url}${prefix}/terms` },
  ];

  return (
    <footer className="mac-theme relative border-t mac-hairline bg-[#07080f] text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-xs">
            <span className="inline-flex items-center gap-2">
              <Mark size={24} />
              <span className="font-display text-[1.1rem] font-semibold tracking-tight text-foreground">
                Xico Clean
              </span>
            </span>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {t("tagline")}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] tabular-nums text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
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

        <div className="mt-14 flex flex-col gap-4 border-t mac-hairline pt-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
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
