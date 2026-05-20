import React from "react";
import prisma from "@/lib/db";
import ParrotsClient from "./ParrotsClient";

export const revalidate = 0; // Always fetch fresh list

async function getParrots() {
  try {
    return await prisma.parrot.findMany({
      include: { images: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching admin parrots:", error);
    return [];
  }
}

export default async function AdminParrotsPage() {
  const parrots = await getParrots();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          Parrots Directory
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          CMS Inventory & Species Details
        </p>
      </div>

      <ParrotsClient initialParrots={parrots} />
    </div>
  );
}
