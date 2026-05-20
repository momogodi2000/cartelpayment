import React from "react";
import prisma from "@/lib/db";
import MessagesClient from "./MessagesClient";

export const revalidate = 0; // Always pull latest messages

async function getData() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    const rawInquiries = await prisma.cartInquiry.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            parrot: true,
          },
        },
      },
    });

    const inquiries = rawInquiries.map((inq) => ({
      ...inq,
      items: inq.items.map((item) => ({
        ...item,
        parrot: {
          ...item.parrot,
          price: Number(item.parrot.price),
        },
      })),
    }));

    return { messages, inquiries };
  } catch (error) {
    console.error("Error retrieving administrative messages/inquiries:", error);
    return { messages: [], inquiries: [] };
  }
}

export default async function AdminMessagesPage() {
  const { messages, inquiries } = await getData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Aviary Communications
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          Review Contact Forms & Cart Reservations
        </p>
      </div>

      {/* Controller */}
      <MessagesClient initialMessages={messages} initialInquiries={inquiries} />
    </div>
  );
}
