"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container, Eyebrow } from "@/components/ui/section";
import { buttonClass, ArrowIcon } from "@/components/ui/button";

const RING_BG =
  "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--brand) 55%, transparent) 90deg, transparent 160deg, color-mix(in oklab, var(--accent) 45%, transparent) 250deg, transparent 320deg)";
const RING_MASK =
  "radial-gradient(closest-side, transparent 58%, #000 60%, #000 66%, transparent 70%)";

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollDrift = useTransform(scrollYProgress, [0, 1], [0, -110]);

  const mvx = useMotionValue(0);
  const mvy = useMotionValue(0);
  const cx = useSpring(mvx, { stiffness: 50, damping: 18 });
  const cy = useSpring(mvy, { stiffness: 50, damping: 18 });

  const ringY = useTransform([scrollDrift, cy], ([s, c]: number[]) => s + c);
  const sparkX = useTransform(cx, (v) => -v * 0.55);
  const sparkY = useTransform(
    [scrollDrift, cy],
    ([s, c]: number[]) => s * 0.45 - c * 0.55,
  );

  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return;
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    mvx.set(((e.clientX - r.left) / r.width - 0.5) * 38);
    mvy.set(((e.clientY - r.top) / r.height - 0.5) * 38);
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
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
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="relative flex min-h-[88svh] items-center overflow-hidden pt-24 pb-16 sm:min-h-[92vh] sm:pt-28 sm:pb-20"
    >
      {/* conic ring — scroll + cursor parallax */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ x: cx, y: ringY }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-40 [animation:spin_36s_linear_infinite] max-md:h-[560px] max-md:w-[560px]"
          style={{
            background: RING_BG,
            maskImage: RING_MASK,
            WebkitMaskImage: RING_MASK,
          }}
        />
      </motion.div>

      {/* floating spark constellation — opposite parallax for depth */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{ x: sparkX, y: sparkY }}
      >
        <FloatSpark className="left-[10%] top-[26%] text-brand/45" size={22} delay="0s" />
        <FloatSpark className="right-[13%] top-[38%] text-accent/45" size={14} delay="-2.4s" />
        <FloatSpark className="left-[20%] bottom-[24%] text-violet/40" size={16} delay="-4.2s" />
        <FloatSpark className="right-[22%] bottom-[30%] text-brand/35" size={12} delay="-1.2s" />
        <FloatSpark className="left-[44%] top-[14%] text-accent/30" size={10} delay="-3.1s" />
      </motion.div>

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
            className="mt-6 font-display text-[2.55rem] font-semibold leading-[1.05] tracking-tight text-balance max-[380px]:text-[2.25rem] sm:mt-7 sm:text-6xl md:text-7xl"
          >
            <span className="block text-foreground">{t("titleLine1")}</span>
            <span className="block text-gradient">{t("titleLine2")}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted text-pretty sm:mt-7 sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-6 flex max-w-[22rem] flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs font-medium text-faint sm:mt-7 sm:max-w-none sm:gap-x-3 sm:text-[13px]"
          >
            {t("stack")
              .split(" · ")
              .map((s, i) => (
                <span key={s} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="h-1 w-1 rounded-full bg-brand/40" />
                  )}
                  {s}
                </span>
              ))}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-8 flex w-full flex-col items-center gap-3 sm:mt-9 sm:w-auto sm:flex-row"
          >
            <Link href="/work" className={buttonClass("primary", "w-full sm:w-auto")}>
              {t("ctaPrimary")}
              <ArrowIcon />
            </Link>
            <Link href="/contact" className={buttonClass("secondary", "w-full sm:w-auto")}>
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </motion.div>
      </Container>

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
