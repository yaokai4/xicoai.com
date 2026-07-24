import fs from "node:fs";
import path from "node:path";

import { registration } from "@/lib/site";

/**
 * The operator drops the electronic business-licence image into
 * `public/legal/` (see the README there). We resolve it once, at module load,
 * so the footer / About page only render the "查看营业执照" link when the file
 * actually exists — a missing image never produces a broken 404 link.
 *
 * Server-only: this reads the filesystem, so import it exclusively from server
 * components (both footers and the About page are server components).
 */
const LICENSE_CANDIDATES = [
  "business-license.png",
  "business-license.jpg",
  "business-license.jpeg",
  "business-license.webp",
];

export const businessLicenseImage: string | null = (() => {
  try {
    const dir = path.join(process.cwd(), "public", "legal");
    for (const name of LICENSE_CANDIDATES) {
      if (fs.existsSync(path.join(dir, name))) return `/legal/${name}`;
    }
  } catch {
    // Filesystem unavailable (e.g. edge runtime) — degrade to no image link.
  }
  return null;
})();

/** Official PRC verification entry for the unified social credit code. */
export const gsxtVerifyUrl = registration.verifyUrl;
