"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ParrotImageInput {
  url: string;
  alt: string;
  order: number;
}

interface ParrotInput {
  name: string;
  slug: string;
  species: string;
  description: string;
  shortDescription: string;
  age: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  origin: string;
  rarity: "COMMON" | "RARE" | "EXCEPTIONAL";
  price: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  behavior: string;
  feeding: string;
  domestication: string;
  healthNotes: string;
  featured: boolean;
  images: ParrotImageInput[];
}

export async function createParrot(data: ParrotInput) {
  try {
    const parrot = await prisma.parrot.create({
      data: {
        name: data.name,
        slug: data.slug,
        species: data.species,
        description: data.description,
        shortDescription: data.shortDescription,
        age: data.age,
        size: data.size,
        sex: data.sex,
        origin: data.origin,
        rarity: data.rarity,
        price: data.price,
        status: data.status,
        behavior: data.behavior,
        feeding: data.feeding,
        domestication: data.domestication,
        healthNotes: data.healthNotes,
        featured: data.featured,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
          })),
        },
      },
    });

    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, parrot };
  } catch (error: unknown) {
    console.error("Error creating parrot:", error);
    const message = error instanceof Error ? error.message : "Failed to create parrot.";
    return { success: false, error: message };
  }
}

export async function updateParrot(id: string, data: ParrotInput) {
  try {
    // Delete existing images first, then recreate them (simple clean strategy)
    await prisma.parrotImage.deleteMany({
      where: { parrotId: id },
    });

    const parrot = await prisma.parrot.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        species: data.species,
        description: data.description,
        shortDescription: data.shortDescription,
        age: data.age,
        size: data.size,
        sex: data.sex,
        origin: data.origin,
        rarity: data.rarity,
        price: data.price,
        status: data.status,
        behavior: data.behavior,
        feeding: data.feeding,
        domestication: data.domestication,
        healthNotes: data.healthNotes,
        featured: data.featured,
        images: {
          create: data.images.map((img) => ({
            url: img.url,
            alt: img.alt,
            order: img.order,
          })),
        },
      },
    });

    revalidatePath("/catalog");
    revalidatePath(`/catalog/${data.slug}`);
    revalidatePath("/");
    return { success: true, parrot };
  } catch (error: unknown) {
    console.error("Error updating parrot:", error);
    const message = error instanceof Error ? error.message : "Failed to update parrot.";
    return { success: false, error: message };
  }
}

export async function deleteParrot(id: string) {
  try {
    // Note: cascade deletion in DB handles image records
    await prisma.parrot.delete({
      where: { id },
    });

    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting parrot:", error);
    const message = error instanceof Error ? error.message : "Failed to delete parrot.";
    return { success: false, error: message };
  }
}
