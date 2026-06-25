"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
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
            <Logo />
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — sibling of header so it reliably stacks above <main> */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 bg-bg transition-all duration-300 md:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <nav className="flex h-full flex-col gap-1 overflow-y-auto px-6 py-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between border-b border-border py-4 font-display text-2xl text-foreground transition-colors hover:text-brand"
            >
              {t(item.key)}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="text-faint"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-bg"
            >
              {t("cta")}
            </Link>
          </div>
        </nav>
      </div>
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
