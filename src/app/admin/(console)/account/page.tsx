import React from "react";
import { requireSuperAdmin, adminListSessions, adminEnrolMFA } from "@/lib/services/admin-auth";
import { formatDate } from "@/lib/format";
import qrcode from "qrcode";
import AccountSecurityClient from "./AccountSecurityClient";
import { UserCheck, Shield, KeyRound, Monitor, ShieldCheck, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const { admin } = await requireSuperAdmin();
  const sessions = await adminListSessions(admin.id);

  let qrSvg: string | null = null;
  let mfaSetupData = null;

  if (!admin.totpEnabled) {
    const enrolData = await adminEnrolMFA(admin.id);
    qrSvg = await qrcode.toString(enrolData.otpauthUrl, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#183C32",
        light: "#FFFFFF",
      },
    });
    mfaSetupData = enrolData;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 mb-2">
            <UserCheck className="h-3.5 w-3.5 text-[#B69A65]" />
            <span>Super Administrator Security</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">
            Account & Security Credentials
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your master password, multi-factor authentication (TOTP), and review active sessions.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs space-y-1">
          <div className="font-bold text-zinc-900 dark:text-white">{admin.name}</div>
          <div className="text-zinc-500 font-mono text-[11px]">{admin.email}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            Active SUPER_ADMIN
          </div>
        </div>
      </div>

      <AccountSecurityClient
        admin={{
          id: admin.id,
          name: admin.name,
          email: admin.email,
          totpEnabled: admin.totpEnabled,
          passwordChangedAt: admin.passwordChangedAt
            ? formatDate(admin.passwordChangedAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })
            : "Never",
        }}
        sessions={sessions.map((s) => ({
          id: s.id,
          ip: s.ip || "127.0.0.1",
          userAgent: s.userAgent || "Unknown browser",
          createdAt: formatDate(s.createdAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true }),
          lastSeenAt: formatDate(s.lastSeenAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true }),
          expiresAt: formatDate(s.expiresAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true }),
          isCurrent: false,
          revokedAt: s.revokedAt ? formatDate(s.revokedAt, "en-GB") : null,
        }))}
        qrSvg={qrSvg}
        mfaSetupData={mfaSetupData}
      />
    </div>
  );
}
