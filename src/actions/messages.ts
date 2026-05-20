"use server";

import prisma from "@/lib/db";
import { contactMessageSchema } from "@/lib/schemas";

export async function submitContactMessage(prevState: any, formData: FormData) {
  try {
    // 1. Extract form fields
    const rawData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      phone: formData.get("phone")?.toString() || "",
      message: formData.get("message")?.toString() || "",
      parrotReference: formData.get("parrotReference")?.toString() || null,
      website: formData.get("website")?.toString() || "",
      middle_name: formData.get("middle_name")?.toString() || "",
    };

    // 2. Traps for Honeypot Spam Bots
    if (rawData.website || rawData.middle_name) {
      console.log("[Spam Filtered] Bot triggered honeypot:", rawData);
      return {
        success: true,
        message: "Your message has been received successfully!",
      };
    }

    // 3. Validate actual inputs using Zod
    const validatedData = contactMessageSchema.safeParse(rawData);

    if (!validatedData.success) {
      const errorMap = validatedData.error.flatten().fieldErrors;
      return {
        success: false,
        errors: errorMap,
        message: "Please correct the validation errors in the form.",
      };
    }

    // 4. Save message to PostgreSQL
    const { name, email, phone, message, parrotReference } = validatedData.data;
    
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
        parrotReference,
      },
    });

    return {
      success: true,
      errors: null,
      message: "Your message has been received! Our caretakers will email or call you shortly.",
    };
  } catch (error) {
    console.error("Error creating contact message:", error);
    return {
      success: false,
      errors: { global: ["An unexpected server error occurred. Please try again later."] },
      message: "An error occurred while sending your message. Please try again.",
    };
  }
}

export async function markMessageAsRead(id: string) {
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking message as read:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteMessage(id: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message." };
  }
}
