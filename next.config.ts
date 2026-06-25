import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // résumé uploads can be up to 10MB
      bodySizeLimit: "12mb",
      // forms run behind the Nginx Proxy Manager reverse proxy
      allowedOrigins: ["xicoai.com", "www.xicoai.com"],
    },
  },
};

export default withNextIntl(nextConfig);
