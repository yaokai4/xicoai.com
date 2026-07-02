import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);
const LOCALES = routing.locales as readonly string[];

/**
 * Map an incoming path on the `mac.` subdomain to the Xico Clean product
 * route, so `mac.xicoai.com/` serves the product page as its home while the
 * browser URL stays clean. Locale prefix is preserved.
 *   /        → /mac        · /en    → /en/mac
 *   /mac     → /mac        · /en/mac → /en/mac   (already there, untouched)
 */
function macProductPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const hasLocale = LOCALES.includes(parts[0]);
  const rest = hasLocale ? parts.slice(1) : parts;
  if (rest[0] === "mac") return pathname;
  const localePart = hasLocale ? `/${parts[0]}` : "";
  const restPart = rest.length ? `/${rest.join("/")}` : "";
  return `${localePart}/mac${restPart}`;
}

export default function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host.startsWith("mac.")) {
    const target = macProductPath(request.nextUrl.pathname);
    // Mutate in place so the method/body/headers survive (server-action POSTs
    // on the subdomain land on the product route intact).
    if (target !== request.nextUrl.pathname) {
      request.nextUrl.pathname = target;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API routes, the admin console, Next internals and static files.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
