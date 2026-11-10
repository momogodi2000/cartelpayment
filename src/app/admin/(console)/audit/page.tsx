import React from "react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { ShieldCheck, User } from "lucide-react";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  await requireSuperAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      admin: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cryptographically stored ledger of all administrative logins, state transitions, and sensitive actions.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-mono font-bold">
          {logs.length} Entries Logged
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 border-y border-zinc-200 uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-4 font-bold text-[#183C32]">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-zinc-800 font-sans">
                    <div>{log.admin?.name || log.actorType}</div>
                    {log.admin?.email && (
                      <div className="text-[10px] text-zinc-400">{log.admin.email}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-zinc-700">
                    {log.entity} {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {log.ip || "127.0.0.1"}
                  </td>
                  <td className="py-3 px-4 font-sans text-zinc-600 max-w-xs truncate" title={log.diff || ""}>
                    {log.diff || "—"}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 font-sans">
                    {formatDate(log.createdAt, "en-GB", { timeZone: "Europe/Paris", includeTime: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
