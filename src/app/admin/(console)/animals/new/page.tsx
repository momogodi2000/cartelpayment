import React from "react";
import { getTranslations } from "next-intl/server";
import { requireSuperAdmin } from "@/lib/services/admin-auth";
import ScopedIntl from "@/i18n/ScopedIntl";
import AnimalForm from "../AnimalForm";
import { loadAnimalFormOptions } from "../form-options";

export const dynamic = "force-dynamic";

export default async function NewAnimalPage() {
  await requireSuperAdmin();
  const [t, { breeds, options }] = await Promise.all([getTranslations("AdminAnimals"), loadAnimalFormOptions()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">{t("newTitle")}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("newSubtitle")}</p>
      </header>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ScopedIntl namespaces={["AdminAnimals"]}>
          <AnimalForm breeds={breeds} options={{ ...options, status: options.status.filter((o) => o.value !== "HELD" && o.value !== "SOLD") }} />
        </ScopedIntl>
      </div>
    </div>
  );
}
