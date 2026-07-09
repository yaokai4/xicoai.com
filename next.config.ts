import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // ip3country reads its binary IP table from its package dir at runtime —
  // keep it un-bundled AND force its files into the standalone trace, or
  // IP-country detection silently dies in production.
  serverExternalPackages: ["ip3country"],
  outputFileTracingIncludes: {
    "**": ["./node_modules/ip3country/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // résumé uploads can be up to 10MB
      bodySizeLimit: "12mb",
      // forms run behind the Caddy reverse proxy (main site + product & mail
      // subdomains). mail.xicoai.com MUST be here or the webmail's server
      // actions (login/send/contacts) are rejected as cross-origin.
      allowedOrigins: [
        "xicoai.com",
        "www.xicoai.com",
        "mac.xicoai.com",
        "mail.xicoai.com",
      ],
    },
  },
};

export default withNextIntl(nextConfig);
