"use server";

import { z } from "zod";
import { TicketCategory } from "@prisma/client";
import { createSupportTicket, replyTicketCustomer } from "@/lib/services/support";

const ticketSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  orderRef: z.string().optional(),
  category: z.nativeEnum(TicketCategory).default(TicketCategory.GENERAL),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  locale: z.string().default("en"),
});

export async function actionCreateSupportTicket(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    orderRef: formData.get("orderRef") || undefined,
    category: (formData.get("category") as TicketCategory) || TicketCategory.GENERAL,
    subject: formData.get("subject"),
    message: formData.get("message"),
    locale: formData.get("locale") || "en",
  };

  const parsed = ticketSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const res = await createSupportTicket(parsed.data);
    return { success: true, ticketRef: res.ticketRef, accessToken: res.accessToken };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create support ticket." };
  }
}

export async function actionReplyCustomerTicket(accessToken: string, message: string) {
  if (!message || message.trim().length < 2) {
    return { success: false, error: "Message too short." };
  }

  try {
    await replyTicketCustomer(accessToken, message);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit reply." };
  }
}
