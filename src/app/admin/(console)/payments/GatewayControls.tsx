"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown } from "lucide-react";
import { actionUpdateGateway, actionMarkGatewayOutage, actionGatewayTrial, actionProbeGateway } from "@/app/actions/admin";

interface GatewayRow {
  id: string;
  label: string;
  method: "card" | "mobile_money";
  priority: number;
  enabled: boolean;
  verified: boolean;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  lastError: string | null;
}

const btn = "rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

export default function GatewayControls({ gateways }: { gateways: GatewayRow[] }) {
  const t = useTranslations("AdminPayments");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      setMessage(null);
      await fn();
      router.refresh();
    });

  const card = gateways.filter((g) => g.method === "card").sort((a, b) => a.priority - b.priority);
  const mobile = gateways.filter((g) => g.method === "mobile_money");

  return (
    <div className="space-y-3">
      {message && <p role="status" className="rounded-lg bg-zinc-100 p-2 text-sm dark:bg-zinc-800">{message}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr>
              {(["priority", "gateway", "verification", "breaker", "lastError", "actions"] as const).map((k) => (
                <th key={k} scope="col" className="px-2 py-1.5 font-semibold">{t(`gwCols.${k}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {card.map((g, i) => (
              <tr key={g.id} className="align-top">
                <td className="px-2 py-2 tabular-nums">{g.priority}</td>
                <td className="px-2 py-2">
                  <span className="font-semibold">{g.label}</span>
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${g.enabled ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-700"}`}>
                    {g.enabled ? t("gw.enabled") : t("gw.disabled")}
                  </span>
                </td>
                <td className="px-2 py-2">{g.verified ? t("gw.verified") : t("gw.unverified")}</td>
                <td className="px-2 py-2">{t(`gw.breakers.${g.state}`)}</td>
                <td className="max-w-xs break-words px-2 py-2 text-xs text-zinc-600 dark:text-zinc-300">{g.lastError ?? "—"}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" className={btn} disabled={pending || i === 0} aria-label={`${t("gw.up")} — ${g.label}`}
                      onClick={() => run(() => actionUpdateGateway({ gatewayId: g.id, priority: Math.max(1, card[i - 1].priority - 1) }))}>
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" className={btn} disabled={pending || i === card.length - 1} aria-label={`${t("gw.down")} — ${g.label}`}
                      onClick={() => run(() => actionUpdateGateway({ gatewayId: g.id, priority: Math.min(99, card[i + 1].priority + 1) }))}>
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" className={btn} disabled={pending}
                      onClick={() => run(() => actionUpdateGateway({ gatewayId: g.id, enabled: !g.enabled }))}>
                      {g.enabled ? t("gw.disable") : t("gw.enable")}
                    </button>
                    <button type="button" className={btn} disabled={pending}
                      onClick={() => {
                        const note = window.prompt(t("gw.outagePrompt"));
                        if (note) run(() => actionMarkGatewayOutage(g.id, note));
                      }}>
                      {t("gw.outage")}
                    </button>
                    <button type="button" className={btn} disabled={pending || g.state === "CLOSED"} onClick={() => run(() => actionGatewayTrial(g.id))}>
                      {t("gw.trial")}
                    </button>
                    <button type="button" className={btn} disabled={pending}
                      onClick={() => {
                        if (!window.confirm(t("gw.probeConfirm"))) return;
                        start(async () => {
                          const r = await actionProbeGateway(g.id, true);
                          setMessage(r.accepted ? t("gw.probeAccepted", { gateway: r.echoedGateway ?? g.id }) : t("gw.probeRejected", { message: r.errorMessage ?? String(r.httpStatus ?? "") }));
                          router.refresh();
                        });
                      }}>
                      {t("gw.probe")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobile.length > 0 && (
        <p className="text-xs text-zinc-500">
          {mobile.map((m) => m.label).join(", ")} — {t("gw.mobileMoney")}
        </p>
      )}
    </div>
  );
}
