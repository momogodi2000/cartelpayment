"use server";

import prisma from "@/lib/db";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email")?.toString() || "";
    const validated = subscribeSchema.safeParse({ email });

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0].message,
      };
    }

    const { email: cleanEmail } = validated.data;

    // Check if subscriber exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (existing.active) {
        return {
          success: true,
          message: "You are already subscribed to our nursery updates!",
        };
      } else {
        // Re-activate
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { active: true },
        });
        return {
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
        };
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        active: true,
      },
    });

    return {
      success: true,
      message: "Successfully subscribed to our premium updates!",
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function toggleSubscriberStatus(id: string) {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) return { success: false, error: "Subscriber not found" };

    await prisma.newsletterSubscriber.update({
      where: { id },
      data: { active: !subscriber.active },
    });

    return { success: true };
  } catch (error) {
    console.error("Toggle subscriber error:", error);
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function deleteSubscriber(id: string) {
  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return { success: false, error: "Failed to delete subscriber" };
  }
}
