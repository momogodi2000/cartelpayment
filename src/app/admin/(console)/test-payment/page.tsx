import React from "react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatMoney } from "@/lib/domain/money";
import { formatDateTime } from "@/lib/format";
import { getEligibleCardGateways } from "@/lib/services/payments/gateway-registry";
import { GATEWAY_CURRENCY, TEST_PAYMENT_XOF_AMOUNT } from "@/lib/services/payments/payment-initialization";
import { getGatewayCircuitState } from "@/lib/services/payments/gateway-health";
import TestPaymentClient, { RefreshTestPayment } from "./TestPaymentClient";
import ScopedIntl from "@/i18n/ScopedIntl";

export const dynamic = "force-dynamic";

export default async function AdminTestPaymentPage() {
  await requireSuperAdmin();
  const locale = await getLocale();
  const t = await getTranslations("AdminTestPayment");

  const testDog = await prisma.animal.findFirst({
    where: { isPaymentTest: true },
    include: { breed: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  const eligible = await getEligibleCardGateways(GATEWAY_CURRENCY, TEST_PAYMENT_XOF_AMOUNT);
  const routing = await Promise.all(
    eligible.map(async (g) => ({ id: g.id, label: g.label, verified: g.verified, state: await getGatewayCircuitState(g.id) }))
  );

  const testOrders = await prisma.order.findMany({
    where: { isTest: true },
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          attempts: { orderBy: { attemptNo: "asc" } },
          events: { orderBy: { receivedAt: "desc" } },
        },
      },
    },
  });

  const priceOk = testDog ? testDog.priceCents === 100 && testDog.currency === "EUR" : false;

  return (
    <div className="space-y-8 max-w-6xl">
      <header>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">{t("subtitle")}</p>
      </header>

      <section aria-labelledby="isolation" className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm">
        <h2 id="isolation" className="font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
          <ShieldCheck className="h-4 w-4 text-[#B69A65]" aria-hidden="true" />
          {t("isolationTitle")}
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
          <li>{t("isolation1")}</li>
          <li>{t("isolation2")}</li>
          <li>{t("isolation3")}</li>
          <li>{t("isolation4")}</li>
        </ul>
      </section>

      {!testDog ? (
        <p role="alert" className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          {t("dogMissing")}
        </p>
      ) : (
        <section className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                {testDog.images[0]?.url && <Image src={testDog.images[0].url} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-zinc-900 dark:text-white">{testDog.name}</p>
                <p className="text-xs text-zinc-500 font-mono">{testDog.slug}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <dt className="text-zinc-500">{t("price")}</dt>
              <dd className="font-bold text-[#183C32] dark:text-emerald-400">{formatMoney(TEST_PAYMENT_XOF_AMOUNT, GATEWAY_CURRENCY, locale)}</dd>
              <dt className="text-zinc-500">{t("status")}</dt>
              <dd className="font-semibold">{testDog.status}</dd>
            </dl>
          </div>

          {!priceOk && (
            <p role="alert" className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {t("priceInvalid", { price: formatMoney(testDog.priceCents, testDog.currency, locale) })}
            </p>
          )}

          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-white">{t("routingTitle")}</h2>
            {routing.length === 0 ? (
              <p className="text-sm text-red-700 mt-1">{t("routingEmpty")}</p>
            ) : (
              <>
                <p className="text-xs text-zinc-500 mt-1">{t("routingOrder")}</p>
                <ol className="list-decimal list-inside text-sm mt-1 space-y-0.5">
                  {routing.map((g) => (
                    <li key={g.id}>
                      <span className="font-semibold">{g.label}</span>{" "}
                      <span className="text-xs text-zinc-500">
                        ({g.verified ? t("gatewayVerified") : t("gatewayUnverified")}, {t("breakerState", { state: g.state })})
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>

          <ScopedIntl namespaces={["AdminTestPayment"]}>
            <TestPaymentClient locale={locale} disabled={!priceOk || routing.length === 0} />
          </ScopedIntl>
        </section>
      )}

      <section aria-labelledby="history" className="space-y-3">
        <h2 id="history" className="font-serif text-xl font-bold text-zinc-900 dark:text-white">{t("historyTitle")}</h2>
        {testOrders.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("historyEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900 text-left text-zinc-500 uppercase">
                <tr>
                  {["colReference", "colCreated", "colAmount", "colGateway", "colPaymentStatus", "colOrderStatus", "colProviderRef", "colWebhook", "colVerified", "colFailure"].map((k) => (
                    <th key={k} scope="col" className="px-3 py-2 font-semibold whitespace-nowrap">
                      {t(k)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                {testOrders.map((o) => {
                  const p = o.payments[0];
                  const winning = p?.attempts.find((a) => a.status === "SUCCEEDED");
                  const failures = p?.attempts.filter((a) => a.errorMessage).map((a) => `${a.gatewayId}: ${a.errorMessage}`) ?? [];
                  const lastEvent = p?.events[0];
                  return (
                    <tr key={o.id} className="align-top">
                      <td className="px-3 py-2 font-mono">{o.reference}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatDateTime(o.createdAt, locale)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{p ? formatMoney(p.amountCents, p.currency, locale) : "—"} {p?.currency}</td>
                      <td className="px-3 py-2">{winning ? `${winning.gatewayId} → ${winning.gatewayActual ?? "?"}` : "—"}</td>
                      <td className="px-3 py-2 font-semibold">{p?.status ?? "—"}</td>
                      <td className="px-3 py-2">{o.status}</td>
                      <td className="px-3 py-2 font-mono">{p?.providerReference ?? "—"}</td>
                      <td className="px-3 py-2">
                        {lastEvent ? t("webhookCount", { count: p!.events.length, outcome: lastEvent.outcome ?? lastEvent.eventType }) : t("webhookNone")}
                      </td>
                      <td className="px-3 py-2">{p?.rawLast ? t("verifiedYes") : t("verifiedNo")}</td>
                      <td className="px-3 py-2 text-red-700 max-w-xs break-words">{failures.join(" | ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {testOrders.length > 0 && <RefreshTestPayment orderRef={testOrders[0].reference} label={t("reconcileButton")} />}
      </section>
    </div>
  );
}
