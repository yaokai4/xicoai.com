"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckGlyph } from "@/components/mac/icons";
import { Band, Wrap, MacWindow } from "@/components/mac/mac-ui";

export function MacHero() {
  const t = useTranslations("mac.hero");
  const tb = useTranslations("mac");
  const reduce = useReducedMotion();
  const trust = t.raw("trust") as string[];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.03 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <Band className="pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* top light wash + 缓慢漂移的极光光斑（GPU 友好，respect reduced-motion） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, color-mix(in oklab, var(--brand) 20%, transparent), transparent 60%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[80vh] overflow-hidden">
        <div
          className="aurora-blob motion-reduce:animate-none absolute -left-[10%] top-[-10%] h-[55vh] w-[55vw] rounded-full opacity-60"
          style={{
            background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 26%, transparent), transparent 70%)",
            animationDuration: "22s",
          }}
        />
        <div
          className="aurora-blob motion-reduce:animate-none absolute right-[-8%] top-[5%] h-[48vh] w-[46vw] rounded-full opacity-50"
          style={{
            background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)",
            animationDuration: "28s",
            animationDelay: "-9s",
          }}
        />
        <div
          className="aurora-blob motion-reduce:animate-none absolute left-[25%] top-[28%] h-[40vh] w-[40vw] rounded-full opacity-40"
          style={{
            background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand-soft) 24%, transparent), transparent 70%)",
            animationDuration: "34s",
            animationDelay: "-17s",
          }}
        />
      </div>

      <Wrap>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.06] px-3.5 py-1.5 text-xs font-medium tracking-wide text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
            {tb("badge")}
          </motion.span>

          <motion.p
            variants={item}
            className="mt-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-brand"
          >
            {t("eyebrow")}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-4 font-display font-semibold leading-[1.02] tracking-tight text-balance text-[clamp(2.75rem,8vw,6rem)]"
          >
            <span className="block text-foreground">{t("titleLine1")}</span>
            <span className="block text-gradient">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <a
              href="/api/download/xico-clean"
              className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-7 py-4 text-[15px] font-medium text-bg transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_color-mix(in_oklab,var(--brand)_60%,transparent)] active:translate-y-0 sm:w-auto"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="transition-transform duration-300 group-hover/btn:translate-y-0.5"
              >
                <path
                  d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 20h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("ctaDownload")}
            </a>
            <a
              href="#features"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-7 py-4 text-[15px] font-medium text-brand transition-colors hover:text-brand-soft sm:w-auto"
            >
              {t("ctaSecondary")}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-3.5 text-[13px] text-faint"
          >
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
                <CheckGlyph className="text-accent" />
                {line}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* big centered product visual */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-4xl sm:mt-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-16 bottom-0 -z-0 opacity-80 blur-[100px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 30%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 70%)",
            }}
          />
          <div className="relative">
            <MacWindow
              src="/mac/shots/dashboard.jpg"
              alt="Xico Clean — 智能扫描仪表盘"
              width={1400}
              height={1275}
              caption={tb("shots.dashboard")}
              eager
            />
          </div>
        </motion.div>
      </Wrap>
    </Band>
  );
}
