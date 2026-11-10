"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";
import { actionSaveAnimal, actionDeleteAnimal } from "@/app/actions/admin-animals";

export interface AnimalFormInitial {
  id: string;
  name: string;
  slug: string;
  breedId: string;
  species: string;
  gender: string;
  size: string;
  dateOfBirth: string; // YYYY-MM-DD
  weightKg: number | null;
  coat: string;
  color: string;
  city: string;
  country: string;
  priceEuros: string;
  status: string;
  published: boolean;
  featured: boolean;
  descriptionEn: string;
  descriptionFr: string;
  temperamentEn: string;
  temperamentFr: string;
  socializationEn: string;
  socializationFr: string;
  pedigree: string;
  microchip: string;
  transportInfo: string;
  healthDocStatus: string;
  seoTitle: string;
  seoDescription: string;
  isPaymentTest: boolean;
}

const input =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm aria-[invalid=true]:border-red-500 dark:border-zinc-700 dark:bg-zinc-800";

function Field({ name, label, children, help }: { name: string; label: string; children: React.ReactNode; help?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{label}</span>
      {children}
      {help && (
        <span id={`${name}-help`} className="block text-xs text-zinc-500">
          {help}
        </span>
      )}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
      <legend className="px-1 font-serif text-lg font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function AnimalForm({
  initial,
  breeds,
  options,
}: {
  initial?: AnimalFormInitial;
  breeds: Array<{ id: string; label: string }>;
  options: {
    species: Array<{ value: string; label: string }>;
    gender: Array<{ value: string; label: string }>;
    size: Array<{ value: string; label: string }>;
    status: Array<{ value: string; label: string }>;
    healthDoc: Array<{ value: string; label: string }>;
  };
}) {
  const t = useTranslations("AdminAnimals");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [badFields, setBadFields] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const locked = initial?.status === "HELD" || initial?.status === "SOLD";

  const bad = (name: string) => badFields.includes(name) || undefined;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (initial?.id) fd.set("id", initial.id);
    if (locked) fd.delete("status");
    setErrorCode(null);
    setBadFields([]);
    setSaved(false);
    start(async () => {
      const res = await actionSaveAnimal(fd);
      if (res.success) {
        setSaved(true);
        if (!initial) router.push(`/admin/animals/${res.animalId}`);
        else router.refresh();
      } else {
        setErrorCode(res.errorCode);
        setBadFields(res.fields ?? []);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <div aria-live="polite">
        {errorCode && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {t(`errors.${errorCode}`)}
          </p>
        )}
        {saved && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            {t("saved")}
          </p>
        )}
      </div>
      {initial?.isPaymentTest && (
        <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{t("testAnimalNote")}</p>
      )}

      <Section title={t("sectionIdentity")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label={t("name")}>
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={initial?.name}
              aria-invalid={bad("name")}
              onChange={(e) => {
                if (!initial)
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[̀-ͯ]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
                  );
              }}
              className={input}
            />
          </Field>
          <Field name="slug" label={t("slug")} help={t("slugHelp")}>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              aria-invalid={bad("slug")}
              aria-describedby="slug-help"
              className={`${input} font-mono`}
            />
          </Field>
          <Field name="breedId" label={t("breed")}>
            <select
              name="breedId"
              required
              defaultValue={initial?.breedId ?? breeds[0]?.id}
              aria-invalid={bad("breedId")}
              className={input}
            >
              {breeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
          <Field name="species" label={t("species")}>
            <select name="species" defaultValue={initial?.species ?? "DOG"} className={input}>
              {options.species.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field name="gender" label={t("gender")}>
            <select name="gender" defaultValue={initial?.gender ?? "MALE"} className={input}>
              {options.gender.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field name="dateOfBirth" label={t("dateOfBirth")}>
            <input
              type="date"
              name="dateOfBirth"
              required
              defaultValue={initial?.dateOfBirth}
              aria-invalid={bad("dateOfBirth")}
              className={input}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("sectionDetails")}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="size" label={t("size")}>
            <select name="size" defaultValue={initial?.size ?? "MEDIUM"} className={input}>
              {options.size.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field name="weightKg" label={t("weight")}>
            <input
              type="number"
              step="0.1"
              min="0"
              name="weightKg"
              defaultValue={initial?.weightKg ?? ""}
              aria-invalid={bad("weightKg")}
              className={input}
            />
          </Field>
          <Field name="coat" label={t("coat")}>
            <input name="coat" maxLength={80} defaultValue={initial?.coat} className={input} />
          </Field>
          <Field name="color" label={t("color")}>
            <input name="color" maxLength={80} defaultValue={initial?.color} className={input} />
          </Field>
          <Field name="city" label={t("city")}>
            <input name="city" maxLength={80} defaultValue={initial?.city} className={input} />
          </Field>
          <Field name="country" label={t("country")}>
            <input
              name="country"
              required
              maxLength={60}
              defaultValue={initial?.country ?? "France"}
              aria-invalid={bad("country")}
              className={input}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("sectionSale")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="priceEuros" label={t("price")}>
            <input
              name="priceEuros"
              inputMode="decimal"
              required
              defaultValue={initial?.priceEuros}
              disabled={initial?.isPaymentTest}
              aria-invalid={bad("priceEuros")}
              className={input}
            />
          </Field>
          <Field name="status" label={t("statusField")} help={locked ? t("statusLocked") : undefined}>
            <select name="status" defaultValue={initial?.status ?? "AVAILABLE"} disabled={locked} className={input}>
              {options.status.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} disabled={initial?.isPaymentTest} />
            {t("published")}
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} disabled={initial?.isPaymentTest} />
            {t("featured")}
          </label>
        </div>
      </Section>

      <Section title={t("sectionDescription")}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field name="descriptionEn" label={t("descriptionEn")}>
            <textarea name="descriptionEn" rows={6} maxLength={5000} defaultValue={initial?.descriptionEn} lang="en" className={input} />
          </Field>
          <Field name="descriptionFr" label={t("descriptionFr")}>
            <textarea name="descriptionFr" rows={6} maxLength={5000} defaultValue={initial?.descriptionFr} lang="fr" className={input} />
          </Field>
          <Field name="temperamentEn" label={t("temperamentEn")}>
            <input name="temperamentEn" maxLength={500} defaultValue={initial?.temperamentEn} lang="en" className={input} />
          </Field>
          <Field name="temperamentFr" label={t("temperamentFr")}>
            <input name="temperamentFr" maxLength={500} defaultValue={initial?.temperamentFr} lang="fr" className={input} />
          </Field>
          <Field name="socializationEn" label={t("socializationEn")}>
            <textarea
              name="socializationEn"
              rows={3}
              maxLength={2000}
              defaultValue={initial?.socializationEn}
              lang="en"
              className={input}
            />
          </Field>
          <Field name="socializationFr" label={t("socializationFr")}>
            <textarea
              name="socializationFr"
              rows={3}
              maxLength={2000}
              defaultValue={initial?.socializationFr}
              lang="fr"
              className={input}
            />
          </Field>
        </div>
      </Section>

      <Section title={t("sectionHealth")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="pedigree" label={t("pedigree")}>
            <input name="pedigree" maxLength={300} defaultValue={initial?.pedigree} className={input} />
          </Field>
          <Field name="microchip" label={t("microchip")}>
            <input name="microchip" maxLength={300} defaultValue={initial?.microchip} className={input} />
          </Field>
          <Field name="transportInfo" label={t("transportInfo")}>
            <textarea name="transportInfo" rows={2} maxLength={1000} defaultValue={initial?.transportInfo} className={input} />
          </Field>
          <Field name="healthDocStatus" label={t("healthDocStatus")} help={t("healthHelp")}>
            <select name="healthDocStatus" defaultValue={initial?.healthDocStatus ?? "UNVERIFIED"} className={input}>
              {options.healthDoc.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t("sectionSeo")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="seoTitle" label={t("seoTitle")}>
            <input name="seoTitle" maxLength={70} defaultValue={initial?.seoTitle} className={input} />
          </Field>
          <Field name="seoDescription" label={t("seoDescription")}>
            <input name="seoDescription" maxLength={170} defaultValue={initial?.seoDescription} className={input} />
          </Field>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <Link
          href="/admin/animals"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("back")}
        </Link>
        <div className="flex gap-3">
          {initial && !initial.isPaymentTest && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(t("deleteConfirm"))) return;
                start(async () => {
                  const res = await actionDeleteAnimal(initial.id);
                  if (res.success) router.push("/admin/animals");
                  else setErrorCode(res.errorCode ?? "NOT_FOUND");
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t("delete")}
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#183C32] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12302A] disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </form>
  );
}
