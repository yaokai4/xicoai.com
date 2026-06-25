"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container, Eyebrow } from "@/components/ui/section";
import { buttonClass, ArrowIcon } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-28 pb-20">
      {/* slow conic ring behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-40 [animation:spin_36s_linear_infinite] max-md:h-[560px] max-md:w-[560px]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--brand) 55%, transparent) 90deg, transparent 160deg, color-mix(in oklab, var(--accent) 45%, transparent) 250deg, transparent 320deg)",
          maskImage:
            "radial-gradient(closest-side, transparent 58%, #000 60%, #000 66%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent 58%, #000 60%, #000 66%, transparent 70%)",
        }}
      />

      {/* floating spark constellation — echoes the brand mark */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1]">
        <FloatSpark className="left-[10%] top-[26%] text-brand/45" size={22} delay="0s" />
        <FloatSpark className="right-[13%] top-[38%] text-accent/45" size={14} delay="-2.4s" />
        <FloatSpark className="left-[20%] bottom-[24%] text-violet/40" size={16} delay="-4.2s" />
        <FloatSpark className="right-[22%] bottom-[30%] text-brand/35" size={12} delay="-1.2s" />
        <FloatSpark className="left-[44%] top-[14%] text-accent/30" size={10} delay="-3.1s" />
      </div>

      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 font-display text-4xl font-semibold leading-[1.06] tracking-tight text-balance sm:text-6xl md:text-7xl"
          >
            <span className="block text-foreground">{t("titleLine1")}</span>
            <span className="block text-gradient">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-2xl text-base leading-relaxed text-muted text-pretty sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/#work" className={buttonClass("primary")}>
              {t("ctaPrimary")}
              <ArrowIcon />
            </Link>
            <Link href="/contact" className={buttonClass("secondary")}>
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </motion.div>
      </Container>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.25em] text-faint"
      >
        <span className="flex flex-col items-center gap-2">
          {t("scroll")}
          <span className="h-8 w-px bg-gradient-to-b from-faint to-transparent" />
        </span>
      </motion.div>
    </section>
  );
}

function FloatSpark({
  className,
  size = 16,
  delay = "0s",
}: {
  className?: string;
  size?: number;
  delay?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`absolute animate-float ${className ?? ""}`}
      style={{ animationDelay: delay }}
    >
      <path
        d="M12 1 C 12.6 7.6 16.4 11.4 23 12 C 16.4 12.6 12.6 16.4 12 23 C 11.4 16.4 7.6 12.6 1 12 C 7.6 11.4 11.4 7.6 12 1 Z"
        fill="currentColor"
      />
    </svg>
  );
}
