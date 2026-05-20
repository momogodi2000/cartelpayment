"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSiteSetting(key: string, value: string) {
  try {
    const updated = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Write Admin Audit Log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "SITE_SETTING_UPDATE",
        details: JSON.stringify({
          key,
          value,
        }),
      },
    });

    revalidatePath("/");
    revalidatePath("/contact");

    return { success: true, updated };
  } catch (error: unknown) {
    console.error(`Error updating setting ${key}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update setting." };
  }
}
