import React from "react";
import prisma from "@/lib/db";
import NewsletterClient from "./NewsletterClient";

export const revalidate = 0; // Live reload subscriber state

async function getNewsletterData() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        recipients: true,
      },
    });

    return { subscribers, campaigns };
  } catch (error) {
    console.error("Error fetching newsletter data:", error);
    return { subscribers: [], campaigns: [] };
  }
}

export default async function AdminNewsletterPage() {
  const { subscribers, campaigns } = await getNewsletterData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Newsletter Campaigns
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          Manage Subscriber Base & Send Marketing/Care Email Updates
        </p>
      </div>

      <NewsletterClient initialSubscribers={subscribers} initialCampaigns={campaigns} />
    </div>
  );
}
