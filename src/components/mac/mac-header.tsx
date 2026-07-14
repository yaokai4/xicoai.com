"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "home", href: "/mac" },
  { key: "features", href: "/mac/features" },
  { key: "security", href: "/mac/security" },
  { key: "pricing", href: "/mac/pricing" },
  { key: "support", href: "/mac/support" },
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
  const tm = useTranslations("mac");
  const pathname = usePathname();
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

  const isActive = (href: string) => pathname === href;

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
        <div className="mx-auto flex h-[58px] max-w-[1380px] items-center justify-between px-5 sm:px-7 lg:px-12">
          <Link
            href="/mac"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label="Xico Clean"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/mac/xico-app-icon.png"
              alt=""
              width={1024}
              height={1024}
              quality={100}
              priority
              className="h-8 w-8 shrink-0"
            />
            <span className="font-display text-[1.05rem] font-semibold tracking-[-0.025em] text-foreground">
              {tm("productName")}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13px] transition-colors",
                  isActive(item.href)
                    ? "font-medium text-foreground"
                    : "text-muted hover:text-foreground",
                )}
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
              href="/mac/buy"
              className="hidden rounded-full bg-foreground px-4 py-2 text-sm font-medium text-bg transition-transform hover:scale-[1.03] sm:inline-flex"
            >
              {t("buy")}
            </Link>
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
            className="fixed inset-x-0 bottom-0 top-[58px] z-40 flex flex-col bg-bg md:hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4">
              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <motion.div key={item.key} variants={itemVariants}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3 py-3 text-[1.05rem] font-medium tracking-tight transition-colors hover:bg-surface active:bg-surface",
                        isActive(item.href) ? "text-brand" : "text-foreground",
                      )}
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
                <Link
                  href="/mac/buy"
                  onClick={() => setMenuOpen(false)}
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-foreground py-3.5 text-[0.95rem] font-medium text-bg transition-transform active:scale-[0.99]"
                >
                  {t("buy")}
                </Link>
              </motion.div>
            </div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between border-t border-border px-5 py-4"
            >
              <div className="flex items-center gap-2">
                <LocaleSwitcher />
                <ThemeToggle />
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
      <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "top-1.5 rotate-45" : "top-0.5")} />
      <span className={cn("absolute left-0 top-1.5 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "opacity-0" : "opacity-100")} />
      <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300", open ? "top-1.5 -rotate-45" : "top-2.5")} />
    </div>
  );
}
