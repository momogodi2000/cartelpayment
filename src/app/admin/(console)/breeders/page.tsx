import React from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { VerificationStatus, DocStatus } from "@prisma/client";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import { prisma } from "@/lib/db/client";
import { formatDateTime } from "@/lib/format";
import { actionSaveBreeder, actionDecideBreederApplication } from "@/app/actions/admin-ops";
import { PageHeader, Card, DataTable, Td, Badge, Empty, fieldClass } from "@/components/admin/ui";
import AdminForm from "@/components/admin/AdminForm";
import ActionButton from "@/components/admin/ActionButton";

export const dynamic = "force-dynamic";

export default async function AdminBreedersPage() {
  await requireSuperAdmin();
  const [t, tc, locale] = await Promise.all([getTranslations("AdminBreeders"), getTranslations("AdminCommon"), getLocale()]);
  const [breeders, applications] = await Promise.all([
    prisma.breeder.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { animals: true } } } }),
    prisma.breederApplication.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const errors = Object.fromEntries(["VALIDATION", "SLUG_TAKEN", "ALREADY_DECIDED"].map((k) => [k, t(`errors.${k}`)]));

  const form = (b?: (typeof breeders)[number]) => (
    <AdminForm action={actionSaveBreeder} submitLabel={t("save")} savingLabel={t("saving")} savedText={t("saved")} errors={errors} fallbackError={tc("error")} resetOnSuccess={!b} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={b?.id ?? ""} />
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("name")}</span><input name="name" required defaultValue={b?.name} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("slug")}</span><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={b?.slug} className={`${fieldClass} font-mono`} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("city")}</span><input name="city" defaultValue={b?.city} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("country")}</span><input name="country" required defaultValue={b?.country ?? "France"} className={fieldClass} /></label>
      <label className="text-sm sm:col-span-2"><span className="mb-1 block font-semibold">{t("contact")}</span><input name="contact" defaultValue={b?.contact} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("descriptionEn")}</span><textarea name="descriptionEn" rows={3} lang="en" defaultValue={b?.descriptionEn} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("descriptionFr")}</span><textarea name="descriptionFr" rows={3} lang="fr" defaultValue={b?.descriptionFr} className={fieldClass} /></label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("verificationStatus")}</span>
        <select name="verificationStatus" defaultValue={b?.verificationStatus ?? "UNVERIFIED"} aria-describedby="verif-help" className={fieldClass}>
          {Object.values(VerificationStatus).map((s) => <option key={s} value={s}>{tc(`verification.${s}`)}</option>)}
        </select>
      </label>
      <label className="text-sm"><span className="mb-1 block font-semibold">{t("documentationStatus")}</span>
        <select name="documentationStatus" defaultValue={b?.documentationStatus ?? "NONE"} className={fieldClass}>
          {Object.values(DocStatus).map((s) => <option key={s} value={s}>{t(`docStatus.${s}`)}</option>)}
        </select>
      </label>
      <p id="verif-help" className="text-xs text-zinc-500 sm:col-span-2">{t("verificationHelp")}</p>
    </AdminForm>
  );

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <Card>
        <details>
          <summary className="cursor-pointer font-semibold text-[#183C32] dark:text-emerald-400">{t("add")}</summary>
          <div className="mt-4">{form()}</div>
        </details>
      </Card>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("breedersTitle")}</h2>
        {breeders.length === 0 ? (
          <Empty>{t("empty")}</Empty>
        ) : (
          <DataTable columns={[t("cols.name"), t("cols.location"), t("cols.verification"), t("cols.documentation"), t("cols.animals"), t("cols.actions")]}>
            {breeders.map((b) => (
              <tr key={b.id}>
                <Td><span className="block font-semibold">{b.name}</span><span className="block font-mono text-xs text-zinc-500">{b.slug}</span></Td>
                <Td>{[b.city, b.country].filter(Boolean).join(", ")}</Td>
                <Td><Badge tone={b.verificationStatus === "VERIFIED" ? "success" : b.verificationStatus === "SUSPENDED" ? "danger" : "warning"}>{tc(`verification.${b.verificationStatus}`)}</Badge></Td>
                <Td>{t(`docStatus.${b.documentationStatus}`)}</Td>
                <Td className="tabular-nums">{b._count.animals}</Td>
                <Td>
                  <details>
                    <summary className="cursor-pointer text-xs font-semibold">{tc("edit")}</summary>
                    <div className="mt-3 w-[min(90vw,40rem)]">{form(b)}</div>
                  </details>
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("applicationsTitle")}</h2>
        {applications.length === 0 ? (
          <Empty>{t("noApplications")}</Empty>
        ) : (
          <DataTable columns={[t("appCols.created"), t("appCols.applicant"), t("appCols.kennel"), t("appCols.location"), t("appCols.experience"), t("appCols.status"), t("appCols.actions")]}>
            {applications.map((a) => (
              <tr key={a.id}>
                <Td className="whitespace-nowrap">{formatDateTime(a.createdAt, locale)}</Td>
                <Td><span className="block font-semibold">{a.name}</span><span className="block text-xs text-zinc-500">{[a.email, a.phone].filter(Boolean).join(" · ")}</span></Td>
                <Td>{a.kennelName ?? "—"}</Td>
                <Td>{[a.city, a.country].filter(Boolean).join(", ") || "—"}</Td>
                <Td>{a.experienceYears ?? "—"}</Td>
                <Td><Badge tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "danger" : "warning"}>{t(`appStatus.${a.status === "APPROVED" || a.status === "REJECTED" ? a.status : "PENDING"}`)}</Badge></Td>
                <Td>
                  {a.status === "PENDING" ? (
                    <div className="flex flex-col gap-1.5">
                      <ActionButton action={actionDecideBreederApplication.bind(null, a.id, "APPROVED")} label={t("approve")} confirmText={t("approveConfirm")} errors={errors} fallbackError={tc("error")} />
                      <ActionButton action={actionDecideBreederApplication.bind(null, a.id, "REJECTED")} label={t("reject")} confirmText={t("rejectConfirm")} errors={errors} fallbackError={tc("error")} />
                    </div>
                  ) : (
                    "—"
                  )}
                </Td>
              </tr>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
