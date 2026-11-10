"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveContentBlock } from "@/app/actions/admin";
import { Plus, Edit2, X, Loader2 } from "lucide-react";

interface BlockItem {
  id: string;
  key: string;
  locale: string;
  title: string | null;
  content: string;
}

export default function ContentBlockModal({ block }: { block?: BlockItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [key, setKey] = useState(block?.key || "");
  const [locale, setLocale] = useState(block?.locale || "en");
  const [title, setTitle] = useState(block?.title || "");
  const [content, setContent] = useState(block?.content || "");

  const handleOpen = () => {
    if (!block) {
      setKey("");
      setLocale("en");
      setTitle("");
      setContent("");
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("key", key);
    formData.append("locale", locale);
    formData.append("title", title);
    formData.append("content", content);

    try {
      const res = await actionSaveContentBlock(formData);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError("Failed to save content block.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {block ? (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
          title="Edit Content Block"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Content Block
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {block ? `Edit Block: ${block.key} (${block.locale})` : "New Content Block"}
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
                    Key *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!block}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="home.hero.announcement"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Locale *
                  </label>
                  <select
                    disabled={!!block}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-50"
                  >
                    <option value="en">English (en)</option>
                    <option value="fr">Français (fr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Optional Title / Heading
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Content Body (Markdown / Text) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
