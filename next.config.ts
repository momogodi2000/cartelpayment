import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/catalogue/:slug",
        destination: "/fr/animaux/:slug",
        permanent: true,
      },
      {
        source: "/en/catalogue/:slug",
        destination: "/en/animals/:slug",
        permanent: true,
      },
      {
        source: "/a-propos",
        destination: "/fr/a-propos",
        permanent: true,
      },
      {
        source: "/sante-vaccination",
        destination: "/fr/sante-vaccination",
        permanent: true,
      },
      {
        source: "/livraison-transport",
        destination: "/fr/livraison-transport",
        permanent: true,
      },
      {
        source: "/devenir-partenaire",
        destination: "/fr/devenir-partenaire",
        permanent: true,
      },
      {
        source: "/mentions-legales",
        destination: "/fr/mentions-legales",
        permanent: true,
      },
      {
        source: "/politique-de-confidentialite",
        destination: "/fr/politique-de-confidentialite",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://res.cloudinary.com",
              "font-src 'self'",
              "connect-src 'self' https://res.cloudinary.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Real client media is immutable once deployed — cache hard at the edge & in the browser.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
