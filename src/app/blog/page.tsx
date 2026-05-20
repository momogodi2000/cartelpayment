import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import prisma from "@/lib/db";

export const revalidate = 3600; // Cache blog listing for 1 hour

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-text-premium tracking-tight">
          AraHaven Care & health Blog
        </h1>
        <p className="text-sm sm:text-base text-text-premium/70 leading-relaxed">
          Expert recommendations, care guidelines, diet breakdowns, and hand-taming training tips directly from our aviary nursery specialists.
        </p>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mt-4" />
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-black/[0.06] shadow-sm">
          <p className="text-text-premium/50 text-sm font-semibold">No blog posts published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col bg-white rounded-3xl overflow-hidden border border-black/[0.06] shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full bg-bg-premium overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/95 text-primary shadow-sm border border-black/[0.03]">
                  {post.category}
                </span>
              </div>

              {/* Contents */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-text-premium/50 font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-extrabold text-lg sm:text-xl text-text-premium group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-premium/65 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.04]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    Read Article <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
