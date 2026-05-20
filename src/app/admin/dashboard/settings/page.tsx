import React from "react";
import prisma from "@/lib/db";
import SettingsClient from "./SettingsClient";

export const revalidate = 0; // Always fetch live settings & audit log entries

async function getSettingsData() {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Show last 100 operations for performance
    });

    return { settings, logs };
  } catch (error) {
    console.error("Error fetching settings and audit logs:", error);
    return { settings: [], logs: [] };
  }
}

export default async function AdminSettingsPage() {
  const { settings, logs } = await getSettingsData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="border-b border-black/[0.04] pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-text-premium tracking-tight">
          System Settings & Audit Logs
        </h1>
        <p className="text-sm text-text-premium/50 font-semibold uppercase tracking-wider mt-0.5">
          Modify Global Configurations & Audit Dashboard Interactions
        </p>
      </div>

      <SettingsClient initialSettings={settings} initialLogs={logs} />
    </div>
  );
}
