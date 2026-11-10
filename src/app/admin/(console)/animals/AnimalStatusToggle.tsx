"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { actionSetAnimalStatus } from "@/app/actions/admin-animals";

const MANUAL = ["AVAILABLE", "UNAVAILABLE", "ARCHIVED"] as const;

/** Quick availability switch; reserved/sold animals are locked (owned by reservations & payments). */
export default function AnimalStatusSelect({ animalId, status }: { animalId: string; status: string }) {
  const t = useTranslations("AdminAnimals");
  const tc = useTranslations("AdminCommon");
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState(false);
  const [pending, start] = useTransition();
  const locked = status === "HELD" || status === "SOLD";

  if (locked) {
    return (
      <span title={t("statusLocked")} className="text-xs text-zinc-500">
        {tc(`animalStatus.${status}`)}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col">
      <select
        aria-label={t("statusField")}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          setError(false);
          start(async () => {
            const res = await actionSetAnimalStatus(animalId, next);
            if (!res.success) {
              setError(true);
              setValue(status);
            }
            router.refresh();
          });
        }}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
      >
        {MANUAL.map((s) => (
          <option key={s} value={s}>{tc(`animalStatus.${s}`)}</option>
        ))}
      </select>
      {error && <span role="alert" className="mt-0.5 text-[11px] text-red-700">{t("statusChangeFailed")}</span>}
    </span>
  );
}
