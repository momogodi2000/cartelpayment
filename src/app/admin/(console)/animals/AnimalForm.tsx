"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { actionSaveAnimal, actionDeleteAnimal } from "@/app/actions/admin";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface BreedOption {
  id: string;
  nameEn: string;
  nameFr: string;
}

interface AnimalFormProps {
  initial?: any;
  breeds: BreedOption[];
}

export default function AnimalForm({ initial, breeds }: AnimalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [breedId, setBreedId] = useState(initial?.breedId || breeds[0]?.id || "");
  const [species, setSpecies] = useState(initial?.species || "DOG");
  const [gender, setGender] = useState(initial?.gender || "MALE");
  const [priceCents, setPriceCents] = useState(initial?.priceCents || 150000);
  const [status, setStatus] = useState(initial?.status || "AVAILABLE");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [city, setCity] = useState(initial?.city || "Paris");
  const [country, setCountry] = useState(initial?.country || "France");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn || "");
  const [descriptionFr, setDescriptionFr] = useState(initial?.descriptionFr || "");
  const [imageUrl, setImageUrl] = useState(initial?.images?.[0]?.url || "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    if (initial?.id) formData.append("id", initial.id);
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("breedId", breedId);
    formData.append("species", species);
    formData.append("gender", gender);
    formData.append("priceCents", String(priceCents));
    formData.append("status", status);
    formData.append("published", String(published));
    formData.append("city", city);
    formData.append("country", country);
    formData.append("descriptionEn", descriptionEn);
    formData.append("descriptionFr", descriptionFr);
    if (imageUrl) formData.append("imageUrl", imageUrl);

    try {
      const res = await actionSaveAnimal(formData);
      if (res.success) {
        router.push("/admin/animals");
      } else {
        setError("Failed to save animal profile.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    if (!confirm("Are you sure you want to delete this animal profile?")) return;
    setLoading(true);
    try {
      await actionDeleteAnimal(initial.id);
      router.push("/admin/animals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/animals"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Animals</span>
        </Link>
        {initial?.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Animal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Breed
            </label>
            <select
              value={breedId}
              onChange={(e) => setBreedId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              {breeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nameEn} ({b.nameFr})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Species
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Adoption Price (€ in cents)
            </label>
            <input
              type="number"
              value={priceCents}
              onChange={(e) => setPriceCents(parseInt(e.target.value || "0", 10))}
              required
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Availability Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="AVAILABLE">Available</option>
              <option value="HELD">Held (Reserved)</option>
              <option value="SOLD">Sold</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Catalog Visibility
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded text-[#183C32]"
              />
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Published on Public Marketplace
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Primary Photo URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Description (English)
          </label>
          <textarea
            rows={3}
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Description (French)
          </label>
          <textarea
            rows={3}
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#183C32] hover:bg-[#122E26] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#B69A65]" /> : <Save className="h-4 w-4" />}
          <span>{initial ? "Save Changes" : "Create Animal Profile"}</span>
        </button>
      </div>
    </form>
  );
}
