import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { OrderStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDateTime, toParisLocalInput } from "@/lib/format";
import { actionSaveDelivery } from "@/app/actions/admin-ops";
import { PageHeader, Card, Badge, Empty, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";

export const dynamic = "force-dynamic";

const FULFILMENT: OrderStatus[] = [OrderStatus.PAID, OrderStatus.DOCUMENTATION_REVIEW, OrderStatus.PREPARING, OrderStatus.TRANSPORT_SCHEDULED, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED];


export default async function AdminDeliveriesPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminDeliveries"), getTranslations("AdminCommon"), getLocale()]);
  const orders = await prisma.order.findMany({
    where: { isTest: false, status: { in: FULFILMENT } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { customer: { select: { name: true, email: true, phone: true } }, item: { select: { animalName: true } }, delivery: true },
  });
  const awaiting = orders.filter((o) => !o.delivery);
  const planned = orders.filter((o) => o.delivery);
  const errors = Object.fromEntries(["VALIDATION", "NOT_FOUND", "TEST_ORDER"].map((k) => [k, t(`errors.${k}`)]));

  const form = (o: (typeof orders)[number]) => (
    <AdminForm action={actionSaveDelivery} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={errors} fallbackError={tc("error")} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="orderId" value={o.id} />
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("method")}</span><input name="method" required defaultValue={o.delivery?.method ?? ""} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("carrier")}</span><input name="carrier" defaultValue={o.delivery?.carrier ?? ""} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("scheduledAt")}</span><input type="datetime-local" name="scheduledAt" defaultValue={toParisLocalInput(o.delivery?.scheduledAt ?? null)} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("estimatedAt")}</span><input type="datetime-local" name="estimatedAt" defaultValue={toParisLocalInput(o.delivery?.estimatedAt ?? null)} className={fieldClass} /></label>
      <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("notes")}</span><textarea name="notes" rows={2} defaultValue={o.delivery?.notes ?? ""} className={fieldClass} /></label>
      <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="delivered" defaultChecked={Boolean(o.delivery?.deliveredAt)} />{t("delivered")}</label>
    </AdminForm>
  );

  const header = (o: (typeof orders)[number]) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="font-mono font-semibold">{o.reference} · <span className="font-sans">{o.item?.animalName}</span></p>
        <p className="text-xs text-zinc-500">{o.customer.name} · {o.customer.email} · {o.customer.phone}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{tc(`orderStatus.${o.status}`)}</Badge>
        {o.delivery?.deliveredAt ? (
          <Badge tone="success">{t("statusDelivered", { time: formatDateTime(o.delivery.deliveredAt, locale) })}</Badge>
        ) : o.delivery?.scheduledAt ? (
          <Badge tone="info">{t("statusScheduled", { time: formatDateTime(o.delivery.scheduledAt, locale) })}</Badge>
        ) : (
          <Badge tone="warning">{t("statusUnscheduled")}</Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("awaiting")}</h2>
        {awaiting.length === 0 ? <Empty>{t("noAwaiting")}</Empty> : awaiting.map((o) => <Card key={o.id} className="space-y-4">{header(o)}{form(o)}</Card>)}
      </section>
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("planned")}</h2>
        {planned.length === 0 ? (
          <Empty>{t("noPlanned")}</Empty>
        ) : (
          planned.map((o) => (
            <Card key={o.id} className="space-y-4">
              {header(o)}
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-[#183C32] dark:text-emerald-400">{tc("edit")}</summary>
                <div className="mt-3">{form(o)}</div>
              </details>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
