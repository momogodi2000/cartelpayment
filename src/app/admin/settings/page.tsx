import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { Settings, Shield, Server, Mail, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const env = getEnv();

  const settings = await prisma.siteSetting.findMany();
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  // Diagnostic presence indicators (never expose secrets!)
  const diagnostics = [
    {
      name: "Database Provider",
      status: env.DATABASE_PROVIDER.toUpperCase(),
      secure: true,
      desc: "SQLite for local dev & testing; Neon Serverless PostgreSQL for production.",
    },
    {
      name: "GeniusPay Environment",
      status: env.GENIUSPAY_ENVIRONMENT.toUpperCase(),
      secure: env.GENIUSPAY_API_KEY.length > 0,
      desc: "API credentials present; card payment method active.",
    },
    {
      name: "Resend Email Service",
      status: env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("placeholder") ? "CONFIGURED" : "MOCK_MODE",
      secure: true,
      desc: "Transactional email provider status.",
    },
    {
      name: "Cloudinary Media",
      status: env.CLOUDINARY_CLOUD_NAME ? "CONFIGURED" : "LOCAL_ASSETS",
      secure: true,
      desc: "Remote media storage & signed upload validation.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900">
          System Configuration & Diagnostics
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Operational parameters, environment secrets presence, and business settings.
        </p>
      </div>

      {/* Security & Service Status */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-zinc-900">
          Security & Service Diagnostics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {diagnostics.map((d, i) => (
            <div key={i} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-zinc-900">{d.name}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {d.status}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Business & Legal Parameters */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="font-serif text-xl font-bold text-zinc-900">
          Operational Rules & Parameters
        </h2>
        <div className="divide-y divide-zinc-100">
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600">Inventory Hold Duration:</span>
            <span className="font-mono font-bold text-zinc-900">{env.HOLD_MINUTES} minutes</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600">Base Transport (France):</span>
            <span className="font-bold text-zinc-900">150.00 €</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600">Cross-Border Transport (EU):</span>
            <span className="font-bold text-zinc-900">250.00 €</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600">Concierge & Veterinary Dossier Fee:</span>
            <span className="font-bold text-zinc-900">49.00 €</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600">Business Registration / SIREN:</span>
            <span className="text-zinc-500 italic">To be completed upon company registration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
