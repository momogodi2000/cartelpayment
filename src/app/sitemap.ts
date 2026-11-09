import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";
import { siteConfig } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl || "https://pawelium.fyi";
  const now = new Date();

  const staticPages = [
    { en: "/en", fr: "/fr", priority: 1.0, freq: "weekly" as const },
    { en: "/en/animals", fr: "/fr/animaux", priority: 0.9, freq: "daily" as const },
    { en: "/en/about", fr: "/fr/a-propos", priority: 0.7, freq: "monthly" as const },
    { en: "/en/health-guarantee", fr: "/fr/sante-vaccination", priority: 0.8, freq: "monthly" as const },
    { en: "/en/transport", fr: "/fr/livraison-transport", priority: 0.8, freq: "monthly" as const },
    { en: "/en/faq", fr: "/fr/faq", priority: 0.7, freq: "monthly" as const },
    { en: "/en/terms", fr: "/fr/conditions-generales-de-vente", priority: 0.5, freq: "yearly" as const },
    { en: "/en/privacy", fr: "/fr/politique-de-confidentialite", priority: 0.5, freq: "yearly" as const },
    { en: "/en/partner", fr: "/fr/devenir-partenaire", priority: 0.6, freq: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${baseUrl}${page.en}`,
      lastModified: now,
      changeFrequency: page.freq,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${baseUrl}${page.en}`,
          fr: `${baseUrl}${page.fr}`,
        },
      },
    });
    entries.push({
      url: `${baseUrl}${page.fr}`,
      lastModified: now,
      changeFrequency: page.freq,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${baseUrl}${page.en}`,
          fr: `${baseUrl}${page.fr}`,
        },
      },
    });
  }

  // Fetch published animals from DB (excluding ARCHIVED; SOLD remains indexable)
  try {
    const animals = await prisma.animal.findMany({
      where: {
        published: true,
        status: { not: "ARCHIVED" },
      },
      select: { slug: true, updatedAt: true },
    });

    for (const a of animals) {
      const enUrl = `${baseUrl}/en/animals/${a.slug}`;
      const frUrl = `${baseUrl}/fr/animaux/${a.slug}`;

      entries.push({
        url: enUrl,
        lastModified: a.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: enUrl,
            fr: frUrl,
          },
        },
      });

      entries.push({
        url: frUrl,
        lastModified: a.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: enUrl,
            fr: frUrl,
          },
        },
      });
    }
  } catch (err) {
    console.error("[Sitemap] Failed to fetch database animals:", err);
  }

  return entries;
}
