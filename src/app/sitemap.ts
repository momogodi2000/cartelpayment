import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://arahaven.com";

  // 1. Core static routes
  const staticRoutes = ["", "/about", "/gallery", "/catalog", "/blog", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Fetch dynamic parrots for sitemap
  let parrotRoutes: MetadataRoute.Sitemap = [];
  try {
    const parrots = await prisma.parrot.findMany({
      select: { slug: true, updatedAt: true },
    });
    parrotRoutes = parrots.map((bird) => ({
      url: `${baseUrl}/catalog/${bird.slug}`,
      lastModified: bird.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching parrots for sitemap:", error);
  }

  // 3. Fetch dynamic blog posts for sitemap
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  return [...staticRoutes, ...parrotRoutes, ...blogRoutes];
}
