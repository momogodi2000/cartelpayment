import { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = siteConfig.siteUrl || "https://pawelium.fyi";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin",
          "/admin/",
          "/*/checkout",
          "/*/checkout/*",
          "/*/paiement",
          "/*/paiement/*",
          "/*/track-order",
          "/*/suivi-commande",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
