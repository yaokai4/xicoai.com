import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import { site, registration } from "@/lib/site";
import { businessLicenseImage } from "@/lib/legal";
import type { Locale } from "@/i18n/routing";

export async function MacFooter() {
  const t = await getTranslations("mac.footer");
  const tn = await getTranslations("mac");
  const td = await getTranslations("mac.download");
  const tf = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;
  const year = new Date().getFullYear();
  const prefix = locale === "zh" ? "" : `/${locale}`;

  const productLinks = [
    { label: t("links.features"), href: `${prefix}/mac/features` },
    { label: t("links.safety"), href: `${prefix}/mac/security#safety` },
    { label: t("links.privacy"), href: `${prefix}/mac/security#privacy` },
    { label: t("links.pricing"), href: `${prefix}/mac/pricing` },
    { label: t("links.faq"), href: `${prefix}/mac/support#faq` },
    { label: td("cta"), href: `${prefix}/mac#download` },
  ];

  const companyLinks = [
    { label: t("links.company"), href: `${site.url}${prefix}` },
    { label: t("links.privacyPolicy"), href: `${site.url}${prefix}/privacy` },
    { label: t("links.terms"), href: `${site.url}${prefix}/terms` },
  ];

  return (
    <footer className="mac-product-surface relative border-t border-border">
      <div className="mx-auto max-w-[1280px] px-7 py-16 sm:px-12 lg:px-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-xs">
            <span className="inline-flex items-center gap-2">
              <Image
                src="/mac/xico-app-icon.png"
                alt=""
                width={1024}
                height={1024}
                quality={100}
                className="h-8 w-8"
              />
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
          <div className="flex flex-col gap-1.5">
            <p>
              © {year} XICO AI. {t("by")}
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-faint/70">
              <span>{site.fullName[locale]}</span>
              <span aria-hidden className="text-faint/40">·</span>
              <a
                href={registration.verifyUrl}
                target="_blank"
                rel="noreferrer"
                title={tf("creditCodeVerify")}
                className="tabular-nums transition-colors hover:text-muted"
              >
                {tf("creditCodeLabel")} {registration.creditCode}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {businessLicenseImage && (
              <a
                href={`${site.url}${businessLicenseImage}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-muted"
              >
                {tf("license")}
              </a>
            )}
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
