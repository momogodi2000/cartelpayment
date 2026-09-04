import { MetadataRoute } from "next";
import animals from "@/data/animals";
import { siteConfig } from "@/data/site";

const LOCALES = ["fr", "en"] as const;

/** Build the /en-prefixed and unprefixed URL pair for a path. */
function localized(baseUrl: string, path: string) {
  return LOCALES.map((locale) => ({
    locale,
    url: `${baseUrl}${locale === "fr" ? "" : "/en"}${path}`,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.siteUrl || "https://pawelium.fyi";
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] =
    [
      { path: "", priority: 1.0, changeFreq: "weekly" },
      { path: "/catalogue", priority: 0.9, changeFreq: "daily" },
      { path: "/devenir-partenaire", priority: 0.8, changeFreq: "monthly" },
      { path: "/a-propos", priority: 0.7, changeFreq: "monthly" },
      { path: "/sante-vaccination", priority: 0.8, changeFreq: "monthly" },
      { path: "/livraison-transport", priority: 0.7, changeFreq: "monthly" },
      { path: "/faq", priority: 0.8, changeFreq: "monthly" },
      { path: "/contact", priority: 0.7, changeFreq: "monthly" },
      { path: "/mentions-legales", priority: 0.3, changeFreq: "yearly" },
      { path: "/politique-de-confidentialite", priority: 0.3, changeFreq: "yearly" },
    ];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const alts = localized(baseUrl, route.path);
    for (const { url } of alts) {
      entries.push({
        url,
        lastModified: now,
        changeFrequency: route.changeFreq,
        priority: route.priority,
        alternates: {
          languages: {
            fr: alts.find((a) => a.locale === "fr")!.url,
            en: alts.find((a) => a.locale === "en")!.url,
          },
        },
      });
    }
  }

  for (const animal of animals) {
    const alts = localized(baseUrl, `/catalogue/${animal.slug}`);
    for (const { url } of alts) {
      entries.push({
        url,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            fr: alts.find((a) => a.locale === "fr")!.url,
            en: alts.find((a) => a.locale === "en")!.url,
          },
        },
      });
    }
  }

  return entries;
}
