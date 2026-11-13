import React from "react";
import Link from "next/link";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";
import { PaymentStatus, Prisma } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import { getResolvedRegistry } from "@/lib/services/payments/gateway-registry";
import { getGatewayCircuitState } from "@/lib/services/payments/gateway-health";
import { derivePaymentStateLabel } from "@/lib/services/payments/payment-state-label";
import ScopedIntl from "@/i18n/ScopedIntl";
import ReconciliationButton from "./ReconciliationButton";
import GatewayControls from "./GatewayControls";
import ExceptionResolveButton from "../ExceptionResolveButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const filterSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional().catch(undefined),
  gateway: z.string().regex(/^[a-z_]{2,40}$/).optional().catch(undefined),
  currency: z.string().regex(/^[A-Z]{3}$/).optional().catch(undefined),
  type: z.enum(["real", "test", "all"]).default("real").catch("real"),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).default(1).catch(1),
});

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireSuperAdmin();
  const raw = await searchParams;
  const f = filterSchema.parse(Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v || undefined])));
  const [t, locale] = await Promise.all([getTranslations("AdminPayments"), getLocale()]);
  const holdMinutes = getEnv().HOLD_MINUTES;

  const where: Prisma.PaymentWhereInput = {
    ...(f.type === "real" ? { isTest: false } : f.type === "test" ? { isTest: true } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.currency ? { currency: f.currency } : {}),
    ...(f.gateway ? { attempts: { some: { gatewayId: f.gateway, status: "SUCCEEDED" } } } : {}),
    ...(f.from || f.to
      ? { createdAt: { ...(f.from ? { gte: new Date(`${f.from}T00:00:00Z`) } : {}), ...(f.to ? { lte: new Date(`${f.to}T23:59:59Z`) } : {}) } }
      : {}),
  };
  const metricWhere: Prisma.PaymentWhereInput = f.type === "real" ? { isTest: false } : f.type === "test" ? { isTest: true } : {};

  const [total, grouped, payments, exceptions, registry] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.groupBy({ by: ["status"], where: metricWhere, _count: { _all: true } }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (f.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        order: { select: { reference: true, customer: { select: { name: true, email: true } } } },
        attempts: { orderBy: { attemptNo: "asc" } },
        events: { orderBy: { receivedAt: "desc" } },
      },
    }),
    prisma.reconciliationException.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { order: { select: { reference: true } } },
      take: 50,
    }),
    getResolvedRegistry(),
  ]);

  const count = (statuses: PaymentStatus[]) =>
    grouped.filter((g) => statuses.includes(g.status)).reduce((s, g) => s + g._count._all, 0);
  const metrics = [
    { key: "total", value: grouped.reduce((s, g) => s + g._count._all, 0) },
    { key: "successful", value: count([PaymentStatus.SUCCESSFUL, PaymentStatus.SUCCEEDED]) },
    { key: "pending", value: count([PaymentStatus.CREATED, PaymentStatus.INITIALIZING, PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.REQUIRES_ACTION]) },
    { key: "failed", value: count([PaymentStatus.FAILED]) },
    { key: "declined", value: count([PaymentStatus.DECLINED]) },
    { key: "cancelled", value: count([PaymentStatus.CANCELLED]) },
    { key: "expired", value: count([PaymentStatus.EXPIRED]) },
    { key: "refunded", value: count([PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUND_PENDING]) },
    { key: "review", value: count([PaymentStatus.REQUIRES_RECONCILIATION]) },
  ];

  const gateways = await Promise.all(
    registry.map(async (g) => {
      const health = await prisma.gatewayHealth.findUnique({ where: { gatewayId: g.id } });
      return {
        id: g.id,
        label: g.label,
        method: g.method,
        priority: g.priority,
        enabled: g.enabled,
        verified: g.verified,
        state: g.method === "card" ? await getGatewayCircuitState(g.id) : ("CLOSED" as const),
        lastError: health?.note || health?.lastError || g.note || null,
      };
    })
  );

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === undefined ? undefined : String(v)])), ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    return `?${params.toString()}`;
  };
  const cardGatewayIds = registry.filter((g) => g.method === "card").map((g) => g.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <ScopedIntl namespaces={["AdminPayments"]}>
          <ReconciliationButton />
        </ScopedIntl>
      </header>

      <section aria-label={t("metrics.total")} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
        {metrics.map((m) => (
          <div key={m.key} className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-zinc-500">{t(`metrics.${m.key}`)}</p>
            <p className="text-2xl font-bold tabular-nums">{m.value}</p>
          </div>
        ))}
      </section>

      {/* Gateways */}
      <section aria-labelledby="gw-title" className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 id="gw-title" className="font-serif text-xl font-bold">{t("gatewaysTitle")}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("gatewaysHelp")}</p>
        <ScopedIntl namespaces={["AdminPayments"]}>
          <GatewayControls gateways={gateways} />
        </ScopedIntl>
      </section>

      {/* Exceptions */}
      <section aria-labelledby="exc-title" className="space-y-3">
        <h2 id="exc-title" className="font-serif text-xl font-bold">{t("exceptionsTitle")}</h2>
        {exceptions.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("exceptionsEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {exceptions.map((e) => (
              <li key={e.id} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm sm:flex-row sm:items-start sm:justify-between dark:border-amber-900 dark:bg-amber-950/30">
                <div>
                  <p className="font-semibold">
                    {t(`exceptionKinds.${e.kind}`)} · <span className="font-mono">{e.order?.reference ?? "—"}</span>
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">{formatDateTime(e.createdAt, locale)}</p>
                  {e.notes && <p className="mt-1 text-zinc-700 dark:text-zinc-200">{e.notes}</p>}
                </div>
                <ScopedIntl namespaces={["AdminPayments"]}>
                  <ExceptionResolveButton exceptionId={e.id} />
                </ScopedIntl>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Filters */}
      <form method="get" className="grid grid-cols-2 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm sm:grid-cols-4 lg:grid-cols-7 dark:border-zinc-800 dark:bg-zinc-900" aria-label={t("filters.title")}>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.type")}</span>
          <select name="type" defaultValue={f.type} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="real">{t("filters.typeReal")}</option>
            <option value="test">{t("filters.typeTest")}</option>
            <option value="all">{t("filters.typeAll")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.status")}</span>
          <select name="status" defaultValue={f.status ?? ""} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{t("filters.all")}</option>
            {Object.values(PaymentStatus).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.gateway")}</span>
          <select name="gateway" defaultValue={f.gateway ?? ""} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{t("filters.all")}</option>
            {cardGatewayIds.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.currency")}</span>
          <select name="currency" defaultValue={f.currency ?? ""} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">{t("filters.all")}</option>
            <option value="EUR">EUR</option>
            <option value="XOF">XOF</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.from")}</span>
          <input type="date" name="from" defaultValue={f.from} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-zinc-500">{t("filters.to")}</span>
          <input type="date" name="to" defaultValue={f.to} className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="rounded-lg bg-[#183C32] px-3 py-1.5 font-semibold text-white">{t("filters.apply")}</button>
          <Link href="/admin/payments" className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">{t("filters.reset")}</Link>
        </div>
      </form>

      {/* Payments */}
      <section className="space-y-3">
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("empty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full bg-white text-sm dark:bg-zinc-950">
              <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
                <tr>
                  {(["created", "order", "customer", "amount", "state", "gateway", "provider", "env"] as const).map((k) => (
                    <th key={k} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">{t(`table.${k}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payments.map((p) => {
                  const winning = p.attempts.find((a) => a.status === "SUCCEEDED");
                  const processedEvents = p.events.filter((e) => e.processedAt).length;
                  const label = derivePaymentStateLabel(p, { processedWebhookCount: processedEvents, holdMinutes });
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="align-top">
                        <td className="whitespace-nowrap px-3 py-2">{formatDateTime(p.createdAt, locale)}</td>
                        <td className="px-3 py-2 font-mono">
                          {p.order.reference}
                          {p.isTest && <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">{t("testBadge")}</span>}
                        </td>
                        <td className="px-3 py-2">
                          <span className="block">{p.order.customer.name}</span>
                          <span className="block text-xs text-zinc-500">{p.order.customer.email}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                          {formatMoney(p.amountCents, p.currency, locale)}
                          {p.originalAmountCents != null && p.originalCurrency && p.originalCurrency !== p.currency && (
                            <span className="block text-[11px] text-zinc-500">
                              {t("fxLine", { original: formatMoney(p.originalAmountCents, p.originalCurrency, locale), rate: p.fxRate ?? "—", source: p.fxSource ?? "—" })}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-semibold">{t(`states.${label}`)}</span>
                          <span className="block text-[11px] text-zinc-500">{p.status}</span>
                        </td>
                        <td className="px-3 py-2">{winning ? `${winning.gatewayId} → ${winning.gatewayActual ?? "?"}` : "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{p.providerReference ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">{p.environment}</td>
                      </tr>
                      <tr>
                        <td colSpan={8} className="bg-zinc-50/60 px-3 pb-3 dark:bg-zinc-900/40">
                          <details>
                            <summary className="cursor-pointer py-2 text-xs font-semibold text-[#183C32] dark:text-emerald-400">{t("showDetails")}</summary>
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <p className="mb-1 text-xs font-bold">{t("attemptsTitle")}</p>
                                {p.attempts.length === 0 ? (
                                  <p className="text-xs text-zinc-500">{t("noAttempts")}</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead className="text-left text-zinc-500">
                                      <tr>
                                        {(["no", "gateway", "requested", "actual", "status", "class", "http", "message", "at"] as const).map((k) => (
                                          <th key={k} scope="col" className="pr-2 font-semibold">{t(`attemptCols.${k}`)}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {p.attempts.map((a) => (
                                        <tr key={a.id} className="align-top">
                                          <td className="pr-2">{a.attemptNo}</td>
                                          <td className="pr-2">{a.gatewayId}</td>
                                          <td className="pr-2">{a.gatewayRequested ?? "default"}</td>
                                          <td className="pr-2">{a.gatewayActual ?? "—"}</td>
                                          <td className="pr-2 font-semibold">{a.status}</td>
                                          <td className="pr-2">{a.errorClass ?? "—"}</td>
                                          <td className="pr-2">{a.httpStatus ?? "—"}</td>
                                          <td className="max-w-[16rem] break-words pr-2">{a.errorMessage ?? "—"}</td>
                                          <td className="whitespace-nowrap">{formatDateTime(a.createdAt, locale)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-bold">{t("eventsTitle")}</p>
                                {p.events.length === 0 ? (
                                  <p className="text-xs text-zinc-500">{t("noEvents")}</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead className="text-left text-zinc-500">
                                      <tr>
                                        {(["type", "received", "processed", "outcome"] as const).map((k) => (
                                          <th key={k} scope="col" className="pr-2 font-semibold">{t(`eventCols.${k}`)}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {p.events.map((e) => (
                                        <tr key={e.id} className="align-top">
                                          <td className="pr-2">{e.eventType}</td>
                                          <td className="whitespace-nowrap pr-2">{formatDateTime(e.receivedAt, locale)}</td>
                                          <td className="whitespace-nowrap pr-2">{e.processedAt ? formatDateTime(e.processedAt, locale) : "—"}</td>
                                          <td className="break-words">{e.outcome ?? "—"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <nav aria-label={t("pageOf", { page: f.page, pages })} className="flex items-center justify-between text-sm">
          {f.page > 1 ? <Link href={qs({ page: String(f.page - 1) })} className="rounded-lg border px-3 py-1.5">{t("previous")}</Link> : <span />}
          <span className="text-zinc-500">{t("pageOf", { page: f.page, pages })}</span>
          {f.page < pages ? <Link href={qs({ page: String(f.page + 1) })} className="rounded-lg border px-3 py-1.5">{t("next")}</Link> : <span />}
        </nav>
      </section>
    </div>
  );
}
