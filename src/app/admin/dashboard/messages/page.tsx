import React from "react";
import prisma from "@/lib/db";
import MessagesClient from "./MessagesClient";

export const revalidate = 0; // Always pull latest messages

async function getMessages() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error retrieving contact messages:", error);
    return [];
  }
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Client Inquiries
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          Review & Archive Messages
        </p>
      </div>

      {/* Controller */}
      <MessagesClient initialMessages={messages} />
    </div>
  );
}
