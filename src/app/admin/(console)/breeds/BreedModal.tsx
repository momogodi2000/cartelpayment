"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveBreed } from "@/app/actions/admin";
import { Plus, Edit2, X, Loader2 } from "lucide-react";

export interface BreedItem {
  id: string;
  nameEn: string;
  nameFr: string;
  slug: string;
  species: string;
  descriptionEn: string;
  descriptionFr: string;
}

export default function BreedModal({ breed }: { breed?: BreedItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState(breed?.nameEn || "");
  const [nameFr, setNameFr] = useState(breed?.nameFr || "");
  const [slug, setSlug] = useState(breed?.slug || "");
  const [species, setSpecies] = useState(breed?.species || "DOG");
  const [descriptionEn, setDescriptionEn] = useState(breed?.descriptionEn || "");
  const [descriptionFr, setDescriptionFr] = useState(breed?.descriptionFr || "");

  const handleOpen = () => {
    if (!breed) {
      setNameEn("");
      setNameFr("");
      setSlug("");
      setSpecies("DOG");
      setDescriptionEn("");
      setDescriptionFr("");
    }
    setOpen(true);
  };

  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    if (!breed) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (breed?.id) formData.append("id", breed.id);
    formData.append("nameEn", nameEn);
    formData.append("nameFr", nameFr);
    formData.append("slug", slug);
    formData.append("species", species);
    formData.append("descriptionEn", descriptionEn);
    formData.append("descriptionFr", descriptionFr);

    try {
      const res = await actionSaveBreed(formData);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError("Failed to save breed record.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {breed ? (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
          title="Edit Breed"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Breed
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {breed ? `Edit Breed: ${breed.nameEn}` : "Register New Breed"}
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
                    Name (EN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Name (FR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameFr}
                    onChange={(e) => setNameFr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Species *
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="DOG">DOG (Canine)</option>
                    <option value="CAT">CAT (Feline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (EN)
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description (FR)
                </label>
                <textarea
                  rows={2}
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
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
                  Save Breed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
