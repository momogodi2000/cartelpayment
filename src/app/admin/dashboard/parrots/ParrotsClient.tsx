"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Search, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { createParrot, updateParrot, deleteParrot } from "@/actions/parrots";

interface ParrotImage {
  id?: string;
  url: string;
  alt: string;
  order: number;
}

interface Parrot {
  id: string;
  name: string;
  slug: string;
  species: string;
  description: string;
  shortDescription: string;
  age: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  origin: string;
  rarity: "COMMON" | "RARE" | "EXCEPTIONAL";
  price: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  behavior: string;
  feeding: string;
  domestication: string;
  healthNotes: string;
  featured: boolean;
  images: ParrotImage[];
}

interface ParrotsClientProps {
  initialParrots: Parrot[];
}

const emptyForm = {
  name: "",
  slug: "",
  species: "",
  description: "",
  shortDescription: "",
  age: "",
  size: "MEDIUM",
  sex: "UNKNOWN",
  origin: "",
  rarity: "COMMON",
  price: "",
  status: "AVAILABLE",
  behavior: "",
  feeding: "",
  domestication: "",
  healthNotes: "",
  featured: false,
  imageUrl: "",
};

export default function ParrotsClient({ initialParrots }: ParrotsClientProps) {
  const [parrots, setParrots] = useState<Parrot[]>(initialParrots);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = parrots.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: Parrot) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      species: p.species,
      description: p.description,
      shortDescription: p.shortDescription,
      age: p.age,
      size: p.size,
      sex: p.sex,
      origin: p.origin,
      rarity: p.rarity,
      price: p.price.toString(),
      status: p.status,
      behavior: p.behavior,
      feeding: p.feeding,
      domestication: p.domestication,
      healthNotes: p.healthNotes,
      featured: p.featured,
      imageUrl: p.images[0]?.url || "",
    });
    setErrors(null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parrot?")) return;
    const res = await deleteParrot(id);
    if (res.success) {
      setParrots((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || "Failed to delete.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrors("Please specify a valid numeric price.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      species: form.species,
      description: form.description,
      shortDescription: form.shortDescription,
      age: form.age,
      size: form.size as "SMALL" | "MEDIUM" | "LARGE",
      sex: form.sex as "MALE" | "FEMALE" | "UNKNOWN",
      origin: form.origin,
      rarity: form.rarity as "COMMON" | "RARE" | "EXCEPTIONAL",
      price: priceNum,
      status: form.status as "AVAILABLE" | "RESERVED" | "SOLD",
      behavior: form.behavior,
      feeding: form.feeding,
      domestication: form.domestication,
      healthNotes: form.healthNotes,
      featured: form.featured,
      images: form.imageUrl
        ? [{ url: form.imageUrl, alt: form.name, order: 0 }]
        : [],
    };

    if (editingId) {
      // Update
      const res = await updateParrot(editingId, payload);
      if (res.success && res.parrot) {
        setParrots((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...payload, price: priceNum, images: payload.images } : p))
        );
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to update.");
      }
    } else {
      // Create
      const res = await createParrot(payload);
      if (res.success && res.parrot) {
        // Simple client side reload helper
        setParrots((prev) => [{ ...res.parrot, images: payload.images } as unknown as Parrot, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to create.");
      }
    }
    setIsSubmitting(false);
  };

  const autoGenerateSlug = () => {
    const slugified = form.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, slug: slugified }));
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-premium/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to CMS
        </Link>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Register New Parrot
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-black/[0.04] shadow-sm max-w-md">
        <Search className="h-4 w-4 text-text-premium/40 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registered birds by name or species..."
          className="outline-none bg-transparent text-xs w-full"
        />
      </div>

      {/* Listing Grid */}
      <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-bg-premium/50 border-b border-black/[0.04]">
              <th className="px-6 py-4 font-bold text-text-premium/60">Bird Details</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Status</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Price</th>
              <th className="px-6 py-4 font-bold text-text-premium/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-text-premium/40 font-semibold">
                  No parrots found. Register one to populate the catalog.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-black/[0.03] hover:bg-bg-premium/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {p.featured && <span title="Featured on home"><Sparkles className="h-4 w-4 text-accent" /></span>}
                      <div>
                        <span className="font-extrabold text-sm text-text-premium block">{p.name}</span>
                        <span className="text-[10px] text-primary font-bold tracking-wider italic uppercase block">
                          {p.species}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold text-white shadow-sm ${
                        p.status === "AVAILABLE" ? "bg-emerald-600" : p.status === "RESERVED" ? "bg-amber-600" : "bg-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary">
                    ${Number(p.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/catalog/${p.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-text-premium/50 hover:text-primary hover:bg-black/[0.02]"
                        title="View page"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit bird detail"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-red-600 hover:bg-red-50"
                        title="Delete listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-black/[0.08] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative text-left">
            <h2 className="text-xl font-extrabold text-text-premium">
              {editingId ? "Update Parrot Information" : "Register New Parrot"}
            </h2>

            {errors && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Bird Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Charlie"
                    className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={autoGenerateSlug}
                    className="px-3 py-2.5 rounded-xl bg-bg-premium text-text-premium/70 text-xs font-bold hover:bg-black/[0.02] border border-black/[0.05]"
                  >
                    Slug
                  </button>
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Url Slug
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. charlie-macaw-baby"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Species */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Species (Scientific)
                </label>
                <input
                  type="text"
                  required
                  value={form.species}
                  onChange={(e) => setForm((prev) => ({ ...prev, species: e.target.value }))}
                  placeholder="e.g. Ara macao"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Price ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g. 3500"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Age details
                </label>
                <input
                  type="text"
                  required
                  value={form.age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder="e.g. 14 Weeks"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Size */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Size Group
                </label>
                <select
                  value={form.size}
                  onChange={(e) => setForm((prev) => ({ ...prev, size: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="SMALL">Small</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LARGE">Large</option>
                </select>
              </div>

              {/* Sex */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Sex (DNA)
                </label>
                <select
                  value={form.sex}
                  onChange={(e) => setForm((prev) => ({ ...prev, sex: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNKNOWN">Unknown (Pending DNA)</option>
                </select>
              </div>

              {/* Rarity */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Rarity Level
                </label>
                <select
                  value={form.rarity}
                  onChange={(e) => setForm((prev) => ({ ...prev, rarity: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="EXCEPTIONAL">Exceptional</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Listing Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Sanctuary Origin
                </label>
                <input
                  type="text"
                  required
                  value={form.origin}
                  onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                  placeholder="e.g. San José Aviary"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Short Catalog Excerpt
                </label>
                <input
                  type="text"
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Summarize key features for grids..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Full Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed biography..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none resize-none"
                />
              </div>

              {/* Behavior */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Behavioral Notes
                </label>
                <input
                  type="text"
                  required
                  value={form.behavior}
                  onChange={(e) => setForm((prev) => ({ ...prev, behavior: e.target.value }))}
                  placeholder="Intelligent, tame, recall trained..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Feeding */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Feeding Regimen
                </label>
                <input
                  type="text"
                  required
                  value={form.feeding}
                  onChange={(e) => setForm((prev) => ({ ...prev, feeding: e.target.value }))}
                  placeholder="Harrisons pellets, fresh mango..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Domestication */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Domestication Rearing
                </label>
                <input
                  type="text"
                  required
                  value={form.domestication}
                  onChange={(e) => setForm((prev) => ({ ...prev, domestication: e.target.value }))}
                  placeholder="Hand-fed since hatching..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Health Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Veterinary & Health Notes
                </label>
                <input
                  type="text"
                  required
                  value={form.healthNotes}
                  onChange={(e) => setForm((prev) => ({ ...prev, healthNotes: e.target.value }))}
                  placeholder="Negative PCR test panel, microchipped..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Featured Switch */}
              <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-black/[0.08] rounded"
                />
                <label htmlFor="featured" className="text-xs font-bold text-text-premium/80">
                  Feature this bird on Homepage Carousel
                </label>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-3 sm:col-span-2 pt-4 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-black/[0.08] text-text-premium/70 text-xs font-bold hover:bg-black/[0.02]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save Parrot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
