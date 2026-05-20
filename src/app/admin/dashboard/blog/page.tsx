import React from "react";
import prisma from "@/lib/db";
import BlogClient from "./BlogClient";

export const revalidate = 0; // Always pull latest articles

async function getPosts() {
  try {
    return await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching admin blog posts:", error);
    return [];
  }
}

export default async function AdminBlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Blog Management
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          Write & Edit Care Guides
        </p>
      </div>

      <BlogClient initialPosts={posts} />
    </div>
  );
}
