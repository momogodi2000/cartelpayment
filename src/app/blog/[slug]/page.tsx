import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import prisma from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic metadata generator
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) return {};

    const pageTitle = `${post.seoTitle || post.title} | AraHaven Blog`;
    const pageDesc = post.seoDescription || post.excerpt;

    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDesc,
        images: post.coverImage ? [post.coverImage] : [],
      },
    };
  } catch (error) {
    return {
      title: "Aviary Care Article",
    };
  }
}

// 2. Main Detail Page render
export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Schema.org BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": post.coverImage,
            "datePublished": post.createdAt,
            "dateModified": post.updatedAt,
            "author": {
              "@type": "Person",
              "name": "AraHaven Nursery Specialists"
            },
            "description": post.excerpt,
            "articleBody": post.content.replace(/<[^>]*>/g, "") // Clean description text
          })
        }}
      />

      {/* Back Button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>

      {/* Post Title & Metadata */}
      <div className="space-y-4 text-left">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 w-fit block">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-premium leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-text-premium/50 font-semibold pt-2">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            <span>By AraHaven Caretakers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-md border border-black/[0.06] bg-bg-premium">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 900px"
        />
      </div>

      {/* Article Body */}
      <div 
        className="prose prose-emerald max-w-none text-text-premium/80 leading-relaxed space-y-6 text-sm sm:text-base border-t border-black/[0.04] pt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags footer */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-8 border-t border-black/[0.04]">
          <Tag className="h-4 w-4 text-primary shrink-0" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-bg-premium border border-black/[0.05] text-text-premium/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
