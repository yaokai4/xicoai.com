import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  clientIp,
  countryFromIp,
  localeForCountry,
  localeFromAcceptLanguage,
} from "./lib/geo";

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

/**
 * First-visit language detection (Next 16 proxy = Node runtime, so the
 * embedded IP table in lib/geo is fine here):
 *   1. an explicit /locale prefix or a NEXT_LOCALE cookie always wins;
 *   2. else the SYSTEM language (Accept-Language);
 *   3. else the IP country;
 * and only GET navigations redirect — server-action POSTs pass through
 * untouched. Returns null when the request should proceed as-is.
 */
function detectLocaleRedirect(request: NextRequest): NextResponse | null {
  if (request.method !== "GET") return null;
  const { pathname } = request.nextUrl;
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && LOCALES.includes(first)) return null; // explicit prefix
  if (request.cookies.get("NEXT_LOCALE")?.value) return null; // remembered pick

  const detected =
    localeFromAcceptLanguage(request.headers.get("accept-language"), LOCALES) ??
    localeForCountry(countryFromIp(clientIp(request.headers)));
  if (!detected || detected === routing.defaultLocale) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${detected}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url, 307);
  // Remember so the visitor isn't re-detected on every unprefixed hit; the
  // language switcher overwrites this cookie on manual change.
  res.cookies.set("NEXT_LOCALE", detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

export default function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

  // Enterprise webmail lives on the `mail.` subdomain. Its own routes are the
  // whole /webmail/* tree (excluded from this matcher, so they serve directly
  // without i18n). Only the bare root needs steering there; every in-app link
  // already carries the /webmail prefix, so nothing else is rewritten.
  if (host.startsWith("mail.")) {
    const p = request.nextUrl.pathname;
    if (p === "/" || p === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/webmail";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  const redirect = detectLocaleRedirect(request);
  if (redirect) return redirect;

  if (host.startsWith("mac.")) {
    const target = macProductPath(request.nextUrl.pathname);
    if (target !== request.nextUrl.pathname) {
      // 重建请求而非原地改 nextUrl：next-intl 对「带语言前缀」的路径（/ja、/en/…）
      // 直接读原始 request.url 生成改写目标——只改 nextUrl 会丢失，/ja 就被当成
      // 公司站首页渲染（用户报告的「日语跳到公司官网」）。
      // new NextRequest(url, request) 连同 method/headers/body 一起继承，
      // 子域上的 server-action POST 依旧完好。
      const url = request.nextUrl.clone();
      url.pathname = target;
      const res = intlMiddleware(new NextRequest(url, request));
      // next-intl 对带语言前缀的路径（/ja、/en/…）返回「放行」（无 x-middleware-rewrite），
      // Next 会继续按原始路径路由——/ja 就落到公司站首页。此时必须由我们自己发 rewrite；
      // intl 已产生 redirect（3xx）或自带 rewrite 时原样透传。
      if (res.headers.get("x-middleware-rewrite") || res.status >= 300) {
        return res;
      }
      const rewrite = NextResponse.rewrite(url, {
        request: { headers: new Headers(request.headers) },
      });
      // 保留 intl 设置的 cookie / 请求头改写等；x-middleware-next 与 rewrite 互斥，剔除。
      res.headers.forEach((v, k) => {
        if (k !== "x-middleware-next" && k !== "x-middleware-rewrite") rewrite.headers.set(k, v);
      });
      return rewrite;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API routes, the admin & webmail consoles, Next
  // internals and static files. (webmail serves its own /webmail/* tree raw.)
  matcher: ["/((?!api|admin|webmail|_next|_vercel|.*\\..*).*)"],
};
