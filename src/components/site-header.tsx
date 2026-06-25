"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo, wordmarkFor } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.18, when: "beforeChildren", staggerChildren: 0.05, delayChildren: 0.03 },
  },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.1 } },
};

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
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
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || menuOpen
            ? "border-b border-border bg-bg/80 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="transition-opacity hover:opacity-80"
            aria-label="XICO"
            onClick={() => setMenuOpen(false)}
          >
            <Logo wordmark={wordmarkFor(locale)} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
            <Link
              href="/contact"
              className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03] sm:inline-flex"
            >
              {t("cta")}
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-border-strong md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
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
            key="mobile-menu"
            variants={overlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-bg md:hidden"
          >
            <nav className="flex flex-1 flex-col overflow-y-auto px-6 pt-4">
              {navItems.map((item) => (
                <motion.div key={item.key} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-border py-[18px] font-display text-[1.65rem] font-medium tracking-tight text-foreground"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1">
                      {t(item.key)}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors group-hover:bg-white/5 group-hover:text-brand">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M9 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              variants={itemVariants}
              className="border-t border-border px-6 py-6"
            >
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-foreground py-4 text-base font-medium text-bg"
              >
                {t("cta")}
              </Link>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {site.email}
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-5">
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "top-1.5 rotate-45" : "top-0.5",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1.5 h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300",
          open ? "top-1.5 -rotate-45" : "top-2.5",
        )}
      />
    </div>
  );
}
