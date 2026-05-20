import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import prisma from "@/lib/db";
import { getServerLocale } from "@/lib/serverTranslations";
import { translateBlogPost } from "@/lib/translations";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic metadata generator
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();
  
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) return {};

    const translated = translateBlogPost(post, locale);
    const pageTitle = `${translated.seoTitle || translated.title} | AraHaven Blog`;
    const pageDesc = translated.seoDescription || translated.excerpt;

    return {
      title: pageTitle,
      description: pageDesc,
      openGraph: {
        title: pageTitle,
        description: pageDesc,
        images: translated.coverImage ? [{ url: translated.coverImage }] : [],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDesc,
        images: translated.coverImage ? [translated.coverImage] : [],
      },
    };
  } catch {
    return {
      title: "Aviary Care Article",
    };
  }
}

// 2. Main Detail Page render
export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getServerLocale();

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    notFound();
  }

  const translated = translateBlogPost(post, locale);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Schema.org BlogPosting JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": translated.title,
            "image": translated.coverImage,
            "datePublished": translated.createdAt,
            "dateModified": translated.updatedAt,
            "author": {
              "@type": "Person",
              "name": "AraHaven Nursery Specialists"
            },
            "description": translated.excerpt,
            "articleBody": translated.content.replace(/<[^>]*>/g, "") // Clean description text
          })
        }}
      />

      {/* Back Button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/60 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> {locale === "en" ? "Back to Blog" : "Retour au blog"}
        </Link>
      </div>

      {/* Post Title & Metadata */}
      <div className="space-y-4 text-left">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 w-fit block">
          {translated.category}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-premium leading-tight tracking-tight">
          {translated.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-text-premium/50 font-semibold pt-2">
          <div className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            <span>{locale === "en" ? "By AraHaven Caretakers" : "Par les soigneurs d'AraHaven"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(translated.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden shadow-md border border-black/[0.06] bg-bg-premium">
        <Image
          src={translated.coverImage}
          alt={translated.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 900px"
        />
      </div>

      {/* Article Body */}
      <div 
        className="prose prose-emerald max-w-none text-text-premium/80 leading-relaxed space-y-6 text-sm sm:text-base border-t border-black/[0.04] pt-8"
        dangerouslySetInnerHTML={{ __html: translated.content }}
      />

      {/* Tags footer */}
      {translated.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-8 border-t border-black/[0.04]">
          <Tag className="h-4 w-4 text-primary shrink-0" />
          {translated.tags.map((tag: string) => (
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
