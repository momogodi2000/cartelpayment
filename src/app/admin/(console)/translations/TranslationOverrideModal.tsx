"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveTranslationOverride } from "@/app/actions/admin";
import { Plus, Edit2, X, Loader2 } from "lucide-react";

interface OverrideItem {
  id: string;
  locale: string;
  namespace: string;
  key: string;
  value: string;
}

export default function TranslationOverrideModal({ override }: { override?: OverrideItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState(override?.locale || "fr");
  const [namespace, setNamespace] = useState(override?.namespace || "common");
  const [key, setKey] = useState(override?.key || "");
  const [value, setValue] = useState(override?.value || "");

  const handleOpen = () => {
    if (!override) {
      setLocale("fr");
      setNamespace("common");
      setKey("");
      setValue("");
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("locale", locale);
    formData.append("namespace", namespace);
    formData.append("key", key);
    formData.append("value", value);

    try {
      const res = await actionSaveTranslationOverride(formData);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError("Failed to save translation override.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {override ? (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
          title="Edit Override"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Override
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {override ? `Edit Override: ${override.namespace}.${override.key}` : "New Translation Override"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Locale *
                  </label>
                  <select
                    disabled={!!override}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                  >
                    <option value="en">English (en)</option>
                    <option value="fr">Français (fr)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Namespace *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!override}
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="common, animals, checkout"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Key path *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!override}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="hero.title or badge.certified"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Override Value *
                </label>
                <textarea
                  rows={3}
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#183C32] text-white font-bold hover:bg-[#122e26] disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
