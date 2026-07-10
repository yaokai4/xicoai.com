"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Download CTAs intentionally hit a file API route. */
import { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mark } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

/* One-page narrative: the nav rows are anchors into /mac. Sub-pages link back
   into the same anchors, so navigation feels identical everywhere. */
const NAV = [
  { key: "features", href: "/mac#features" },
  { key: "safety", href: "/mac#safety" },
  { key: "pricing", href: "/mac#pricing" },
  { key: "faq", href: "/mac#faq" },
] as const;

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.18, when: "beforeChildren", staggerChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.1 } },
};

export function MacHeader() {
  const t = useTranslations("mac.nav");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="mac-theme">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || menuOpen
            ? "mac-glass border-b mac-hairline"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/mac"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Xico Clean"
            onClick={() => setMenuOpen(false)}
          >
            <Mark size={24} />
            <span className="font-display text-[1.1rem] font-semibold tracking-tight text-foreground">
              Xico Clean
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Xico Clean">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
            <a
              href="/api/download/xico-clean"
              className="cta-aurora hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold sm:inline-flex"
            >
              <DownloadGlyph />
              {t("download")}
            </a>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-border-strong md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mac-menu"
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mac-canvas fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col md:hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4">
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <motion.div key={item.key} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-3 py-3 text-[1.05rem] font-medium tracking-tight text-foreground transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]"
                    >
                      {t(item.key)}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="text-faint">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.div variants={itemVariants}>
                <a
                  href="/api/download/xico-clean"
                  onClick={() => setMenuOpen(false)}
                  className="cta-aurora mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[0.95rem] font-semibold transition-transform active:scale-[0.99]"
                >
                  <DownloadGlyph />
                  {t("download")}
                </a>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between border-t mac-hairline px-5 py-4"
            >
              <LocaleSwitcher />
              <Link
                href="/mac/support"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {t("support")}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DownloadGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v11m0 0l-4-4m4 4l4-4M4.5 20h15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-5">
      <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "top-1.5 rotate-45" : "top-0.5")} />
      <span className={cn("absolute left-0 top-1.5 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "opacity-0" : "opacity-100")} />
      <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "top-1.5 -rotate-45" : "top-2.5")} />
    </div>
  );
}
