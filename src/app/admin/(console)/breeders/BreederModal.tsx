"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveBreeder } from "@/app/actions/admin";
import { Plus, Edit2, X, Loader2 } from "lucide-react";

interface BreederItem {
  id: string;
  name: string;
  contact: string;
  city: string;
  country: string;
  slug: string;
  descriptionEn: string;
  descriptionFr: string;
}

export default function BreederModal({ breeder }: { breeder?: BreederItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(breeder?.name || "");
  const [slug, setSlug] = useState(breeder?.slug || "");
  const [contact, setContact] = useState(breeder?.contact || "");
  const [city, setCity] = useState(breeder?.city || "Paris");
  const [country, setCountry] = useState(breeder?.country || "France");
  const [descriptionEn, setDescriptionEn] = useState(breeder?.descriptionEn || "");
  const [descriptionFr, setDescriptionFr] = useState(breeder?.descriptionFr || "");

  const handleOpen = () => {
    if (!breeder) {
      setName("");
      setSlug("");
      setContact("");
      setCity("Paris");
      setCountry("France");
      setDescriptionEn("");
      setDescriptionFr("");
    }
    setOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!breeder) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (breeder?.id) formData.append("id", breeder.id);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("email", contact);
    formData.append("city", city);
    formData.append("country", country);
    formData.append("descriptionEn", descriptionEn);
    formData.append("descriptionFr", descriptionFr);

    try {
      const res = await actionSaveBreeder(formData);
      if (res.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError("Failed to save breeder record.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {breeder ? (
        <button
          onClick={handleOpen}
          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
          title="Edit Breeder"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#183C32] hover:bg-[#122e26] text-white text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Breeder
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {breeder ? `Edit Breeder: ${breeder.name}` : "Register Partner Breeder"}
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
                    Name / Kennel *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
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
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact (Email / Phone) *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="contact@kennel.com | +33 6 00 00 00 00"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
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
                  Save Breeder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
