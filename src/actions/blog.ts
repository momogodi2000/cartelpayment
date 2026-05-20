"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

export async function createBlogPost(data: BlogPostInput) {
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        published: data.published,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });

    revalidatePath("/blog");
    return { success: true, post };
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    return { success: false, error: error?.message || "Failed to create blog post." };
  }
}

export async function updateBlogPost(id: string, data: BlogPostInput) {
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        published: data.published,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    return { success: true, post };
  } catch (error: any) {
    console.error("Error updating blog post:", error);
    return { success: false, error: error?.message || "Failed to update blog post." };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath("/blog");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return { success: false, error: error?.message || "Failed to delete blog post." };
  }
}
