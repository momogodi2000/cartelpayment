"use server";

import prisma from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
});

export async function createCampaign(formData: { title: string; subject: string; body: string }) {
  try {
    const validated = campaignSchema.parse(formData);
    const { title, subject, body } = validated;

    const campaign = await prisma.emailCampaign.create({
      data: {
        title,
        subject,
        body,
        status: "DRAFT",
      },
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "EMAIL_CAMPAIGN_CREATE",
        details: JSON.stringify({ campaignId: campaign.id, title }),
      },
    });

    return { success: true, campaign };
  } catch (error: unknown) {
    console.error("Create campaign error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create campaign" };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await prisma.emailCampaign.delete({
      where: { id },
    });

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "EMAIL_CAMPAIGN_DELETE",
        details: JSON.stringify({ campaignId: id }),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete campaign error:", error);
    return { success: false, error: "Failed to delete campaign" };
  }
}

export async function sendCampaign(campaignId: string) {
  try {
    // 1. Fetch Campaign
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return { success: false, error: "Campaign not found" };
    if (campaign.status === "SENT") return { success: false, error: "Campaign already sent" };

    // 2. Fetch Active Subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) {
      return { success: false, error: "No active subscribers to send to." };
    }

    // 3. Mark Campaign as SENT in Database
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // 4. Send Emails and Record Status (sequential or Promise.all)
    const sendPromises = subscribers.map(async (sub) => {
      let status: "SENT" | "FAILED" = "SENT";
      let errorMsg: string | null = null;

      try {
        await sendMail({
          to: sub.email,
          subject: campaign.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #1A6B3C; text-align: center;">AraHaven Aviary</h2>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
              <div style="color: #333; line-height: 1.6; font-size: 14px;">
                ${campaign.body}
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
              <p style="font-size: 11px; color: #999; text-align: center;">
                You are receiving this because you subscribed to updates from AraHaven Exotic Aviary.
                <br/>
                To unsubscribe, please contact us at nursery@arahaven.com.
              </p>
            </div>
          `,
        });
      } catch (err: unknown) {
        console.error(`Failed to send campaign email to ${sub.email}:`, err);
        status = "FAILED";
        errorMsg = err instanceof Error ? err.message : "SMTP error";
      }

      // Record Recipient status
      await prisma.emailCampaignRecipient.create({
        data: {
          emailCampaignId: campaignId,
          email: sub.email,
          status,
          sentAt: status === "SENT" ? new Date() : null,
          errorMessage: errorMsg,
        },
      });
    });

    await Promise.all(sendPromises);

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        userId: "ADMIN",
        userEmail: "admin@arahaven.com",
        action: "EMAIL_CAMPAIGN_SEND",
        details: JSON.stringify({ campaignId, recipientsCount: subscribers.length }),
      },
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Send campaign error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to broadcast email campaign" };
  }
}
