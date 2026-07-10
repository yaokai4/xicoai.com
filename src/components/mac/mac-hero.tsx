"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckGlyph } from "@/components/mac/icons";
import { Band, Wrap, MacWindow } from "@/components/mac/mac-ui";

export function MacHero() {
  const t = useTranslations("mac.hero");
  const tb = useTranslations("mac");
  const reduce = useReducedMotion();
  const trust = t.raw("trust") as string[];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Band className="pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* one quiet light wash at the very top — no drifting blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46rem]"
        style={{
          background:
            "radial-gradient(56% 42% at 50% -8%, rgba(124,151,242,0.13), transparent 70%)",
        }}
      />

      <Wrap>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {tb("badge")}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display font-bold leading-[1.06] tracking-tight text-balance text-[clamp(2.5rem,7vw,4.5rem)]"
          >
            <span className="block text-foreground">{t("titleLine1")}</span>
            <span className="block text-gradient">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-[17px] leading-[1.65] text-muted text-pretty sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <a
              href="/api/download/xico-clean"
              className="cta-aurora group/btn inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold sm:w-auto"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="transition-transform duration-300 group-hover/btn:translate-y-0.5"
              >
                <path
                  d="M12 3v11m0 0l-4-4m4 4l4-4M4.5 20h15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("ctaDownload")}
            </a>
            <Link
              href="/mac#pricing"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-7 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:border-white/[0.2] hover:bg-white/[0.05] sm:w-auto"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>

          <motion.p variants={item} className="mt-4 text-[13px] tabular-nums text-faint">
            {t("downloadNote")}
          </motion.p>

          <motion.ul
            variants={item}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5"
          >
            {trust.map((line) => (
              <li
                key={line}
                className="flex items-center gap-1.5 text-[13px] text-muted"
              >
                <CheckGlyph className="h-3.5 w-3.5 text-accent" />
                {line}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* hero visual: real dashboard in window chrome, with the real
            menu-bar strip floating offset above it */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-4xl sm:mt-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-12 -top-10 bottom-6 -z-10 opacity-70 blur-[110px]"
            style={{
              background:
                "radial-gradient(58% 55% at 50% 34%, rgba(124,151,242,0.2), rgba(167,144,240,0.1) 55%, transparent 75%)",
            }}
          />

          {/* real menu-bar glyph strip, offset above the window */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-9 right-2 z-10 hidden w-[46%] max-w-[520px] md:block"
          >
            <div className="overflow-hidden rounded-lg border border-white/[0.1] bg-[#101322]/95 px-2.5 py-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur">
              <Image
                src="/shots-03/menubar-rich.png"
                alt={tb("menubar.caption")}
                width={1179}
                height={90}
                priority
                sizes="(max-width: 768px) 0px, 520px"
                className="block h-auto w-full"
              />
            </div>
          </motion.div>

          <MacWindow
            src="/shots-03/home-dark.png"
            alt={tb("shots.dashboard")}
            width={1800}
            height={1520}
            eager
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </motion.div>
      </Wrap>
    </Band>
  );
}
