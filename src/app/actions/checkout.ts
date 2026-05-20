"use server";

import prisma from "@/lib/db";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  message: z.string().optional().default(""),
  preferredContact: z.enum(["EMAIL", "WHATSAPP", "PHONE"]),
  parrotIds: z.array(z.string()).min(1, "Please add at least one bird to your inquiry"),
});

export async function processCheckout(formData: z.infer<typeof checkoutSchema>) {
  try {
    // 1. Validate Form Fields
    const validatedData = checkoutSchema.parse(formData);
    const { name, email, phone, country, message, preferredContact, parrotIds } = validatedData;

    // 2. Fetch Parrots to confirm existence and prices
    const parrots = await prisma.parrot.findMany({
      where: {
        id: { in: parrotIds },
      },
    });

    if (parrots.length === 0) {
      return { success: false, error: "None of the selected parrots were found in our directory." };
    }

    // 3. Run database transaction to create inquiry and cart items
    const inquiry = await prisma.$transaction(async (tx) => {
      // Create primary inquiry
      const createdInquiry = await tx.cartInquiry.create({
        data: {
          name,
          email,
          phone,
          country,
          message,
          preferredContact,
          status: "PENDING",
        },
      });

      // Link items
      await tx.cartInquiryItem.createMany({
        data: parrotIds.map((pid) => ({
          cartInquiryId: createdInquiry.id,
          parrotId: pid,
        })),
      });

      // Update parrot status to RESERVED to lock them
      await tx.parrot.updateMany({
        where: { id: { in: parrotIds } },
        data: { status: "RESERVED" },
      });

      // Write Admin Audit Log
      await tx.adminAuditLog.create({
        data: {
          userId: "GUEST",
          userEmail: email,
          action: "CART_INQUIRY_CREATE",
          details: JSON.stringify({
            inquiryId: createdInquiry.id,
            name,
            parrotsCount: parrotIds.length,
          }),
        },
      });

      return createdInquiry;
    });

    // 4. Construct Email summaries
    const birdSummaryHTML = parrots
      .map((p) => `<li><strong>${p.name}</strong> (${p.species}) - $${Number(p.price).toLocaleString()}</li>`)
      .join("");

    const customerEmailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1A6B3C; text-align: center;">AraHaven Aviary</h2>
        <p>Dear ${name},</p>
        <p>Thank you for submitting your reservation inquiry. Our expert caretakers are reviewing your request and will contact you via <strong>${preferredContact}</strong> shortly.</p>
        <h3 style="border-bottom: 2px solid #1A6B3C; padding-bottom: 5px;">Your Reservation Summary:</h3>
        <ul>
          ${birdSummaryHTML}
        </ul>
        <p><strong>Preferred Contact Method:</strong> ${preferredContact}</p>
        <p><strong>Your Message:</strong> ${message || "N/A"}</p>
        <br/>
        <p>If you have urgent questions, you can click to chat with us directly on WhatsApp using your Inquiry reference: <strong>${inquiry.id.slice(0, 8)}</strong>.</p>
        <p>Warm regards,<br/>The AraHaven Nursery Team</p>
      </div>
    `;

    const adminEmailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #c27807;">New Cart Inquiry Submitted</h2>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Customer Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
        <p><strong>Inquiry ID:</strong> ${inquiry.id}</p>
        <h3>Requested Parrots:</h3>
        <ul>
          ${birdSummaryHTML}
        </ul>
        <p><strong>Customer Message:</strong> ${message || "No message provided"}</p>
      </div>
    `;

    // 5. Fire Emails (async/fire-and-forget but logged)
    sendMail({
      to: email,
      subject: "AraHaven Aviary - Reservation Inquiry Received",
      html: customerEmailHTML,
    }).catch((e) => console.error("Error sending customer inquiry confirmation", e));

    sendMail({
      to: process.env.SMTP_FROM || "nursery@arahaven.com",
      subject: `New Lead: Cart Inquiry from ${name}`,
      html: adminEmailHTML,
    }).catch((e) => console.error("Error sending admin inquiry notification", e));

    return {
      success: true,
      inquiryId: inquiry.id,
      whatsappText: generateWhatsAppText(validatedData, parrots),
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Checkout process error:", error);
    return { success: false, error: "An unexpected error occurred during checkout. Please try again." };
  }
}

function generateWhatsAppText(
  data: z.infer<typeof checkoutSchema>,
  parrots: any[]
) {
  const intro = data.preferredContact === "WHATSAPP"
    ? `Hello AraHaven! My name is ${data.name} from ${data.country}. I just submitted a reservation inquiry on your website and would like to proceed via WhatsApp.`
    : `Hello AraHaven! My name is ${data.name} from ${data.country}. I submitted a reservation inquiry (Preferred Contact: ${data.preferredContact}).`;

  const birds = parrots.map((p) => `- ${p.name} (${p.species})`).join("\n");
  const msgText = data.message ? `\nMy message:\n"${data.message}"` : "";

  return `${intro}\n\nSelected Birds:\n${birds}${msgText}\n\nEmail: ${data.email}\nPhone: ${data.phone}`;
}
