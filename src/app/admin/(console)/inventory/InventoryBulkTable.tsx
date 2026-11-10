"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { actionSetAnimalPublished } from "@/app/actions/admin-animals";

interface Row { id: string; name: string; href: string; breed: string; status: string; price: string; published: boolean }

export default function InventoryBulkTable({ rows }: { rows: Row[] }) {
  const t = useTranslations("AdminInventory");
  const tc = useTranslations("AdminCommon");
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const all = selected.size === rows.length && rows.length > 0;

  const bulk = (published: boolean) =>
    start(async () => {
      const res = await actionSetAnimalPublished([...selected], published);
      setMessage(t("bulkDone", { count: res.count }));
      setSelected(new Set());
      router.refresh();
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={pending || selected.size === 0} onClick={() => bulk(true)} className="rounded-lg bg-[#183C32] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">{t("publish")}</button>
        <button type="button" disabled={pending || selected.size === 0} onClick={() => bulk(false)} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-50 dark:border-zinc-700">{t("unpublish")}</button>
        {message && <span role="status" className="text-sm text-zinc-600 dark:text-zinc-300">{message}</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
            <tr>
              <th scope="col" className="px-3 py-2">
                <input type="checkbox" aria-label={t("selectAll")} checked={all} onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))} />
              </th>
              <th scope="col" className="px-3 py-2">{t("cols.name")}</th>
              <th scope="col" className="px-3 py-2">{t("cols.breed")}</th>
              <th scope="col" className="px-3 py-2">{t("cols.status")}</th>
              <th scope="col" className="px-3 py-2">{t("cols.price")}</th>
              <th scope="col" className="px-3 py-2">{t("cols.published")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2"><input type="checkbox" aria-label={`${t("select")} ${r.name}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="px-3 py-2"><Link href={r.href} className="font-semibold text-[#183C32] hover:underline dark:text-emerald-400">{r.name}</Link></td>
                <td className="px-3 py-2">{r.breed}</td>
                <td className="px-3 py-2">{tc(`animalStatus.${r.status}`)}</td>
                <td className="px-3 py-2 tabular-nums">{r.price}</td>
                <td className="px-3 py-2">{r.published ? tc("yes") : tc("no")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
