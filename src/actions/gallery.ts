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
  } catch (error: any) {
    console.error("Error creating gallery item:", error);
    return { success: false, error: error?.message || "Failed to create gallery item." };
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
  } catch (error: any) {
    console.error("Error updating gallery item:", error);
    return { success: false, error: error?.message || "Failed to update gallery item." };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    await prisma.galleryItem.delete({
      where: { id },
    });

    revalidatePath("/gallery");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error?.message || "Failed to delete gallery item." };
  }
}
