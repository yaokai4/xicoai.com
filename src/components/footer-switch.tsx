"use client";

import { usePathname } from "@/i18n/navigation";

/**
 * Picks the product footer on the Xico Clean site (either the `/mac` route or
 * the mac.* subdomain) and the company footer everywhere else. Both are server
 * components rendered upstream and passed in as elements.
 */
export function FooterSwitch({
  isMacSite = false,
  company,
  product,
}: {
  isMacSite?: boolean;
  company: React.ReactNode;
  product: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProduct =
    isMacSite || pathname === "/mac" || pathname.startsWith("/mac/");
  return <>{isProduct ? product : company}</>;
}
