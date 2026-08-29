import { MetadataRoute } from "next";
import dogs from "@/data/dogs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://caniprestige.eu";

  // Static routes
  const staticRoutes = [
    { route: "", priority: 1.0, changeFreq: "weekly" as const },
    { route: "/catalogue", priority: 0.9, changeFreq: "daily" as const },
    { route: "/about", priority: 0.7, changeFreq: "monthly" as const },
    { route: "/sante-vaccination", priority: 0.8, changeFreq: "monthly" as const },
    { route: "/livraison-transport", priority: 0.7, changeFreq: "monthly" as const },
    { route: "/faq", priority: 0.8, changeFreq: "monthly" as const },
    { route: "/contact", priority: 0.7, changeFreq: "monthly" as const },
    { route: "/mentions-legales", priority: 0.3, changeFreq: "yearly" as const },
    { route: "/politique-de-confidentialite", priority: 0.3, changeFreq: "yearly" as const },
  ].map(({ route, priority, changeFreq }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));

  // Dog detail pages from static data
  const dogRoutes = dogs.map((dog) => ({
    url: `${baseUrl}/catalogue/${dog.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...dogRoutes];
}
