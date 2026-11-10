"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveSiteSetting } from "@/app/actions/admin";
import { Save, Check, Loader2, Globe } from "lucide-react";

interface SeoConfig {
  metaTitleEn: string;
  metaTitleFr: string;
  metaDescEn: string;
  metaDescFr: string;
  ogImage: string;
  keywords: string;
}

export default function SeoSettingsForm({ initial }: { initial: SeoConfig }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<SeoConfig>(initial);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await actionSaveSiteSetting("seo_metadata", JSON.stringify(form));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <Check className="h-4 w-4" />
          SEO and OpenGraph metadata updated successfully.
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
        <h2 className="font-serif text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#B69A65]" />
          Global Search Engine Optimization (EN / FR)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Page Title Template (EN)
            </label>
            <input
              type="text"
              value={form.metaTitleEn}
              onChange={(e) => setForm({ ...form, metaTitleEn: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Page Title Template (FR)
            </label>
            <input
              type="text"
              value={form.metaTitleFr}
              onChange={(e) => setForm({ ...form, metaTitleFr: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Meta Description (EN)
            </label>
            <textarea
              rows={3}
              value={form.metaDescEn}
              onChange={(e) => setForm({ ...form, metaDescEn: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Meta Description (FR)
            </label>
            <textarea
              rows={3}
              value={form.metaDescFr}
              onChange={(e) => setForm({ ...form, metaDescFr: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
            />
          </div>
        </div>

        <div className="text-xs space-y-3 pt-2">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              OpenGraph Preview Image URL
            </label>
            <input
              type="text"
              value={form.ogImage}
              onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Keywords (Comma-separated)
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#183C32] text-white font-bold text-xs hover:bg-[#122e26] disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save SEO Settings
          </button>
        </div>
      </div>
    </form>
  );
}
