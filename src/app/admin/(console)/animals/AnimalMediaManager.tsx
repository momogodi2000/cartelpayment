"use client";

import React, { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Upload, Loader2, FileText, ShieldCheck } from "lucide-react";
import {
  actionCreateMediaUpload,
  actionAttachAnimalMedia,
  actionRemoveAnimalImage,
  actionMoveAnimalImage,
  actionVerifyAnimalDocument,
  actionRemoveAnimalDocument,
} from "@/app/actions/admin-animals";

interface MediaItem { id: string; url: string; kind: "IMAGE" | "VIDEO"; altEn: string | null; altFr: string | null }
interface DocItem { id: string; title: string; type: string; verifiedBy: string | null; isPublicSummary: boolean }

const btn = "inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800";

/** Direct-to-Cloudinary uploads with server-signed parameters and server-side verification. */
export default function AnimalMediaManager({
  animalId,
  media,
  documents,
  docTypes,
  configured,
}: {
  animalId: string;
  media: MediaItem[];
  documents: DocItem[];
  docTypes: Array<{ value: string; label: string }>;
  configured: boolean;
}) {
  const t = useTranslations("AdminAnimals");
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const altEn = useRef<HTMLInputElement>(null);
  const altFr = useRef<HTMLInputElement>(null);
  const docType = useRef<HTMLSelectElement>(null);
  const docTitle = useRef<HTMLInputElement>(null);

  async function upload(kind: "image" | "video" | "document", file: File) {
    setError(null);
    setBusy(kind);
    try {
      const signed = await actionCreateMediaUpload(animalId, kind);
      if (!signed.success) throw new Error(signed.errorCode);
      if (file.size > signed.upload.maxBytes) throw new Error("MEDIA_TOO_LARGE");
      const body = new FormData();
      Object.entries(signed.upload.fields).forEach(([k, v]) => body.append(k, v));
      body.append("file", file);
      const res = await fetch(signed.upload.uploadUrl, { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.public_id) throw new Error("UPLOAD_FAILED");
      const attached = await actionAttachAnimalMedia({
        animalId,
        kind,
        publicId: json.public_id,
        altEn: altEn.current?.value || "",
        altFr: altFr.current?.value || "",
        docType: kind === "document" ? (docType.current?.value as never) : undefined,
        title: kind === "document" ? docTitle.current?.value || "" : "",
      });
      if (!attached.success) throw new Error(attached.errorCode);
      router.refresh();
    } catch (err) {
      const code = (err as Error).message;
      setError(t(`errors.${/^[A-Z_]+$/.test(code) ? code : "UPLOAD_FAILED"}`));
    } finally {
      setBusy(null);
    }
  }

  const picker = (kind: "image" | "video" | "document", label: string, accept: string) => (
    <label className={`${btn} cursor-pointer ${!configured || busy ? "pointer-events-none opacity-50" : ""}`}>
      {busy === kind ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
      {busy === kind ? t("uploading") : label}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        disabled={!configured || !!busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(kind, f);
        }}
      />
    </label>
  );

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="space-y-8">
      {!configured && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{t("errors.MEDIA_NOT_CONFIGURED")}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("mediaTitle")}</h2>
        <p className="text-xs text-zinc-500">{t("mediaLimits")}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("altEn")}</span><input ref={altEn} maxLength={200} lang="en" className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" /></label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("altFr")}</span><input ref={altFr} maxLength={200} lang="fr" className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" /></label>
        </div>
        <div className="flex flex-wrap gap-2">
          {picker("image", t("uploadImage"), "image/jpeg,image/png,image/webp,image/avif")}
          {picker("video", t("uploadVideo"), "video/mp4,video/webm,video/quicktime")}
        </div>
        {media.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("mediaEmpty")}</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m, i) => (
              <li key={m.id} className="space-y-2 rounded-2xl border border-zinc-200 p-2 dark:border-zinc-800">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
                  {m.kind === "VIDEO" ? (
                    <video src={m.url} className="h-full w-full object-cover" muted playsInline preload="metadata" aria-label={m.altEn || ""} />
                  ) : (
                    <Image src={m.url} alt={m.altEn || ""} fill sizes="200px" className="object-cover" />
                  )}
                </div>
                <div className="flex justify-between gap-1">
                  <button type="button" className={btn} disabled={pending || i === 0} aria-label={t("moveUp")} onClick={() => run(() => actionMoveAnimalImage(m.id, "up"))}><ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /></button>
                  <button type="button" className={btn} disabled={pending || i === media.length - 1} aria-label={t("moveDown")} onClick={() => run(() => actionMoveAnimalImage(m.id, "down"))}><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" /></button>
                  <button type="button" className={`${btn} text-red-700`} disabled={pending} aria-label={t("remove")} onClick={() => window.confirm(t("removeConfirm")) && run(() => actionRemoveAnimalImage(m.id))}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">{t("documentsTitle")}</h2>
        <p className="text-xs text-zinc-500">{t("documentsHelp")}</p>
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("docType")}</span>
            <select ref={docType} className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
              {docTypes.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="text-sm"><span className="mb-1 block font-semibold">{t("docTitle")}</span><input ref={docTitle} maxLength={200} className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800" /></label>
          {picker("document", t("uploadDocument"), "application/pdf,image/jpeg,image/png")}
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("documentsEmpty")}</p>
        ) : (
          <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {documents.map((d) => (
              <li key={d.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#B69A65]" aria-hidden="true" />
                  <span className="font-semibold">{d.title}</span>
                  <span className="text-xs text-zinc-500">{docTypes.find((x) => x.value === d.type)?.label}</span>
                  <span className={`text-xs ${d.verifiedBy ? "text-emerald-700" : "text-zinc-500"}`}>{d.verifiedBy ? t("verified", { by: d.verifiedBy }) : t("notVerified")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/api/admin/documents/${d.id}`} target="_blank" rel="noopener noreferrer" className={btn}>{t("openDocument")}</a>
                  {!d.verifiedBy && (
                    <button type="button" className={btn} disabled={pending} onClick={() => run(() => actionVerifyAnimalDocument(d.id, window.confirm(t("showSummary"))))}>
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{t("markVerified")}
                    </button>
                  )}
                  <button type="button" className={`${btn} text-red-700`} disabled={pending} onClick={() => window.confirm(t("removeConfirm")) && run(() => actionRemoveAnimalDocument(d.id))}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />{t("remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
