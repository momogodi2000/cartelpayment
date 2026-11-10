"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Eye, Loader2, X } from "lucide-react";
import { actionUpdateOrderStatus, actionRecordManualPayment } from "@/app/actions/admin";

export interface OrderDialogData {
  id: string;
  reference: string;
  status: string;
  statusLabel: string;
  isTest: boolean;
  customer: { name: string; email: string; phone: string };
  animalName: string;
  breedName: string;
  amounts: { subtotal: string; transport: string; fees: string; tax: string; total: string };
  payments: Array<{ id: string; status: string; amount: string; reference: string | null; at: string }>;
  history: Array<{ id: string; to: string; reason: string | null; at: string }>;
  nextStatuses: Array<{ value: string; label: string }>;
  canRecordManualPayment: boolean;
}

const field = "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800";

export default function OrderActionModal({ order }: { order: OrderDialogData }) {
  const t = useTranslations("AdminOrders");
  const tc = useTranslations("AdminCommon");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "status" | "manual">("details");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (fn: (fd: FormData) => Promise<unknown>, errorText: string) => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("orderId", order.id);
    setError(null);
    start(async () => {
      try {
        await fn(fd);
        setOpen(false);
        router.refresh();
      } catch {
        setError(errorText);
      }
    });
  };

  const tabs: Array<{ key: typeof tab; label: string; show: boolean }> = [
    { key: "details", label: t("tabDetails"), show: true },
    { key: "status", label: t("tabStatus"), show: true },
    { key: "manual", label: t("tabManual"), show: order.canRecordManualPayment },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        {t("manage")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby={`order-${order.id}-title`}>
          <div className="relative max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl bg-white p-6 dark:bg-zinc-900 sm:p-8">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
              <div>
                <h2 id={`order-${order.id}-title`} className="font-serif text-2xl font-bold">{t("dialogTitle", { ref: order.reference })}</h2>
                <p className="text-sm text-zinc-500">{t("currentStatus", { status: order.statusLabel })}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={tc("close")} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

            <div role="tablist" className="flex flex-wrap gap-2 text-sm font-semibold">
              {tabs.filter((x) => x.show).map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === x.key}
                  onClick={() => setTab(x.key)}
                  className={`rounded-lg px-3 py-1.5 ${tab === x.key ? "bg-[#183C32] text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            {tab === "details" && (
              <div className="space-y-4 text-sm">
                <div className="grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">{t("customer")}</p>
                    <p className="font-semibold">{order.customer.name}</p>
                    <p className="text-zinc-600 dark:text-zinc-300">{order.customer.email}</p>
                    <p className="text-zinc-600 dark:text-zinc-300">{order.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">{t("animal")}</p>
                    <p className="font-semibold">{order.animalName}</p>
                    <p className="text-zinc-600 dark:text-zinc-300">{t("breed", { breed: order.breedName })}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-1 font-semibold">{t("amounts")}</p>
                  <dl className="grid grid-cols-2 gap-x-4 text-zinc-600 dark:text-zinc-300">
                    <dt>{t("subtotal")}</dt><dd className="text-right tabular-nums">{order.amounts.subtotal}</dd>
                    <dt>{t("transport")}</dt><dd className="text-right tabular-nums">{order.amounts.transport}</dd>
                    <dt>{t("fees")}</dt><dd className="text-right tabular-nums">{order.amounts.fees}</dd>
                    <dt>{t("tax")}</dt><dd className="text-right tabular-nums">{order.amounts.tax}</dd>
                    <dt className="font-semibold text-zinc-900 dark:text-white">{tc("total")}</dt><dd className="text-right font-semibold tabular-nums">{order.amounts.total}</dd>
                  </dl>
                </div>
                <div>
                  <p className="mb-1 font-semibold">{t("payments")}</p>
                  {order.payments.length === 0 ? (
                    <p className="text-zinc-500">{t("noPayments")}</p>
                  ) : (
                    <ul className="space-y-1">
                      {order.payments.map((p) => (
                        <li key={p.id} className="flex justify-between gap-2 text-xs">
                          <span className="font-mono">{p.reference ?? "—"}</span>
                          <span>{p.status} · {p.amount} · {p.at}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="mb-1 font-semibold">{t("history")}</p>
                  {order.history.length === 0 ? (
                    <p className="text-zinc-500">{t("noHistory")}</p>
                  ) : (
                    <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-zinc-200 p-3 text-xs dark:border-zinc-800">
                      {order.history.map((h) => (
                        <li key={h.id} className="flex justify-between gap-3 border-b border-zinc-100 pb-1 last:border-0 dark:border-zinc-800">
                          <span><strong>{h.to}</strong>{h.reason ? ` — ${h.reason}` : ""}</span>
                          <span className="whitespace-nowrap text-zinc-500">{h.at}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {tab === "status" && (
              order.nextStatuses.length === 0 ? (
                <p className="text-sm text-zinc-500">{t("noTransition")}</p>
              ) : (
                <form onSubmit={submit(actionUpdateOrderStatus, t("statusTransitionError"))} className="space-y-4 text-sm">
                  <p className="text-zinc-600 dark:text-zinc-300">{t("statusHelp")}</p>
                  <label className="block">
                    <span className="mb-1 block font-semibold">{t("nextStatus")}</span>
                    <select name="status" required defaultValue="" className={field}>
                      <option value="" disabled>{t("chooseStatus")}</option>
                      {order.nextStatuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-semibold">{t("reason")}</span>
                    <input name="reason" required maxLength={500} placeholder={t("reasonPlaceholder")} className={field} />
                  </label>
                  <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#183C32] py-2.5 font-semibold text-white disabled:opacity-60">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {pending ? t("updating") : t("confirmStatus")}
                  </button>
                </form>
              )
            )}

            {tab === "manual" && order.canRecordManualPayment && (
              <form onSubmit={submit(actionRecordManualPayment, tc("error"))} className="space-y-4 text-sm">
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">{t("manualWarning")}</p>
                <label className="block">
                  <span className="mb-1 block font-semibold">{t("bankRef")}</span>
                  <input name="bankReference" required minLength={3} maxLength={120} className={`${field} font-mono`} />
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold">{t("justification")}</span>
                  <textarea name="justification" required minLength={10} maxLength={2000} rows={3} className={field} />
                </label>
                <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#183C32] py-2.5 font-semibold text-white disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {pending ? t("recording") : t("confirmManual")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
