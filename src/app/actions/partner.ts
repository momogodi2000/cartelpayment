"use server";

import { z } from "zod";
import prisma from "@/lib/db/client";

const partnerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  kennelName: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  statusType: z.string().optional(),
  experienceYears: z.string().optional(),
  notes: z.string().optional(),
  rawPayload: z.string().optional(),
});

export async function actionSubmitBreederApplication(payload: unknown) {
  try {
    const parsed = partnerSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
    }

    const app = await prisma.breederApplication.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp,
        kennelName: parsed.data.kennelName,
        city: parsed.data.city,
        country: parsed.data.country,
        statusType: parsed.data.statusType,
        experienceYears: parsed.data.experienceYears,
        notes: parsed.data.notes,
        rawPayload: parsed.data.rawPayload,
        status: "PENDING",
      },
    });

    return { success: true, id: app.id };
  } catch (err: any) {
    console.error("[BreederApplication] Error persisting application:", err);
    return { success: false, error: err.message || "Failed to persist application." };
  }
}
