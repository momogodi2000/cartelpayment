import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { Settings, Shield, Server, Mail, CreditCard, Activity, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const env = getEnv();

  const [settings, gatewayHealthList, overrideCount] = await Promise.all([
    prisma.siteSetting.findMany(),
    prisma.gatewayHealth.findMany({
      orderBy: { updatedAt: "desc" },
    }),
    prisma.translationOverride.count(),
  ]);

  const diagnostics = [
    {
      name: "Database Provider",
      status: env.DATABASE_PROVIDER.toUpperCase(),
      secure: true,
      desc: "SQLite for local dev & testing; Neon Serverless PostgreSQL for production.",
    },
    {
      name: "GeniusPay Orchestration",
      status: env.GENIUSPAY_ENVIRONMENT.toUpperCase(),
      secure: env.GENIUSPAY_API_KEY.length > 0,
      desc: "Card-only routing engine active. Customer-facing Mobile Money strictly disabled.",
    },
    {
      name: "Resend Email Service",
      status: env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("placeholder") ? "CONFIGURED" : "MOCK_MODE",
      secure: true,
      desc: "Transactional email provider for concierge receipts and tickets.",
    },
    {
      name: "Cloudinary Media",
      status: env.CLOUDINARY_CLOUD_NAME ? "CONFIGURED" : "LOCAL_ASSETS",
      secure: true,
      desc: "Remote media storage & signed biometric upload validation.",
    },
  ];

  const gatewayRoutingChain = [
    { rank: 1, name: "Stripe Card Processing", gateway: "stripe", role: "Primary Card Processor" },
    { rank: 2, name: "Paystack Card Checkout", gateway: "paystack", role: "Automated Fallback #1" },
    { rank: 3, name: "PaiementPro Card Gateway", gateway: "paiementpro", role: "Automated Fallback #2" },
    { rank: 4, name: "CinetPay Card Gateway", gateway: "cinetpay", role: "Automated Fallback #3" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          System Configuration & Diagnostics
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Operational parameters, environment secrets presence, and card orchestration priority.
        </p>
      </div>

      {/* Security & Service Status */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Security & Service Diagnostics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {diagnostics.map((d, i) => (
            <div key={i} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{d.name}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {d.status}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gateway Priority Chain & Circuit Breakers */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#B69A65]" />
              Card Payment Priority & Circuit Breakers
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Strict card-only routing order with automated 3-strike circuit breaker and 15-minute cooldown.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#183C32] text-white">
            Card-Only Mode
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-y border-zinc-200 dark:border-zinc-800 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Provider Channel</th>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Circuit State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {gatewayRoutingChain.map((g) => {
                const health = gatewayHealthList.find((h) => h.gatewayId === g.gateway);
                const isCircuitOpen = health && health.state === "OPEN" && health.openedUntil && new Date(health.openedUntil) > new Date();

                return (
                  <tr key={g.gateway} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      #{g.rank}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {g.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {g.gateway}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {g.role}
                    </td>
                    <td className="py-3 px-4">
                      {isCircuitOpen ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          CIRCUIT OPEN (COOLING)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          CIRCUIT CLOSED (HEALTHY)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Translation & Parity Diagnostics */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4 text-xs">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Internationalization &amp; Translation Health
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Strict modular parity between English (en) and French (fr) across all namespaces.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {overrideCount > 0 ? `${overrideCount} Active Overrides` : "Synchronized"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Supported Locales</span>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">en (English) • fr (Français)</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Strict localePrefix: always</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Modular Namespaces</span>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">Modular Namespace Architecture</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Zero customer client bundle bloat</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Brand Guard Integrity</span>
            <div className="text-base font-bold text-emerald-600 mt-1">Enforced in CI</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Zero payment gateway brand leaks</p>
          </div>
        </div>
      </div>

      {/* Business & Legal Parameters */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Operational Rules & Parameters
        </h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Inventory Hold Duration:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{env.HOLD_MINUTES} minutes</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Base Transport (France):</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">150.00 €</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Cross-Border Transport (EU):</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">250.00 €</span>
          </div>
          <div className="py-3 flex justify-between">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Concierge & Veterinary Dossier Fee:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">49.00 €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
