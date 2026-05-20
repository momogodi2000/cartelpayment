"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface GalleryItemInput {
  title: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  caption: string;
  category: string;
  order: number;
}

export async function createGalleryItem(data: GalleryItemInput) {
  try {
    const item = await prisma.galleryItem.create({
      data: {
        title: data.title,
        type: data.type,
        url: data.url,
        caption: data.caption,
        category: data.category,
        order: data.order,
      },
    });

    revalidatePath("/gallery");
    return { success: true, item };
  } catch (error: unknown) {
    console.error("Error creating gallery item:", error);
    const message = error instanceof Error ? error.message : "Failed to create gallery item.";
    return { success: false, error: message };
  }
}

export async function updateGalleryItem(id: string, data: GalleryItemInput) {
  try {
    const item = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        url: data.url,
        caption: data.caption,
        category: data.category,
        order: data.order,
      },
    });

    revalidatePath("/gallery");
    return { success: true, item };
  } catch (error: unknown) {
    console.error("Error updating gallery item:", error);
    const message = error instanceof Error ? error.message : "Failed to update gallery item.";
    return { success: false, error: message };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await prisma.galleryItem.delete({
      where: { id },
    });

    revalidatePath("/gallery");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting gallery item:", error);
    const message = error instanceof Error ? error.message : "Failed to delete gallery item.";
    return { success: false, error: message };
  }
}
