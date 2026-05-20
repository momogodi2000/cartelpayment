"use client";

import React, { useState, useRef } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Search, Eye, Sparkles, Link2, Upload, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createParrot, updateParrot, deleteParrot } from "@/actions/parrots";

interface ParrotImage {
  id?: string;
  url: string;
  alt: string;
  order: number;
  provider?: string;
  storageKey?: string | null;
  fileHash?: string | null;
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
  imageProvider: "external",
  imageKey: "",
  imageFileHash: "",
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-[hsl(var(--input-border))] bg-white dark:bg-[hsl(var(--input-bg))] text-text-premium dark:text-[hsl(var(--input-text))] text-xs outline-none focus:border-primary transition-colors placeholder:text-text-premium/30 dark:placeholder:text-[hsl(var(--input-placeholder))]";
const selectCls =
  "w-full px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-[hsl(var(--input-border))] bg-white dark:bg-[hsl(var(--input-bg))] text-text-premium dark:text-[hsl(var(--input-text))] text-xs outline-none";

export default function ParrotsClient({ initialParrots }: ParrotsClientProps) {
  const [parrots, setParrots] = useState<Parrot[]>(initialParrots);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image mode: "url" or "upload"
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      imageProvider: p.images[0]?.provider || "external",
      imageKey: p.images[0]?.storageKey || "",
      imageFileHash: p.images[0]?.fileHash || "",
    });
    setImageMode("url");
    setErrors(null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageMode("url");
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrors(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.error || "Upload failed.");
      } else {
        setForm((prev) => ({
          ...prev,
          imageUrl: data.url,
          imageProvider: data.provider || "uploadthing",
          imageKey: data.key || "",
          imageFileHash: data.fileHash || "",
        }));
      }
    } catch {
      setErrors("Upload failed. Check your connection.");
    } finally {
      setIsUploading(false);
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
      images: [{
        url: form.imageUrl || "/logo.png",
        alt: form.name || "AraHaven parrot",
        order: 0,
        provider: form.imageUrl ? form.imageProvider : "local",
        storageKey: form.imageKey || undefined,
        fileHash: form.imageFileHash || undefined,
      }],
    };

    if (editingId) {
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
      const res = await createParrot(payload);
      if (res.success && res.parrot) {
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

  const previewUrl = form.imageUrl || "/logo.png";

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
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Register New Parrot
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center bg-[hsl(var(--card-bg))] border border-[hsl(var(--card-border))] px-4 py-3 rounded-2xl shadow-sm max-w-md">
        <Search className="h-4 w-4 text-text-premium/40 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search registered birds by name or species..."
          className="outline-none bg-transparent text-xs w-full text-text-premium placeholder:text-text-premium/40"
        />
      </div>

      {/* Table */}
      <div className="bg-[hsl(var(--card-bg))] rounded-3xl border border-[hsl(var(--card-border))] overflow-x-auto shadow-sm">
        <table className="min-w-[760px] w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-bg-premium/50 border-b border-[hsl(var(--card-border))]">
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
                <tr key={p.id} className="border-b border-[hsl(var(--card-border))] hover:bg-bg-premium/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-[hsl(var(--card-border))] shrink-0 bg-bg-premium/50">
                        <Image
                          src={p.images[0]?.url || "/logo.png"}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                      {p.featured && <span title="Featured on home"><Sparkles className="h-4 w-4 text-accent shrink-0" /></span>}
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
                        className="p-2 rounded-lg text-text-premium/50 hover:text-primary hover:bg-primary/5 transition-colors"
                        title="View page"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete"
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

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[hsl(var(--modal-bg))] rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-[hsl(var(--card-border))] shadow-2xl space-y-6 my-8 relative text-left">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-text-premium">
                {editingId ? "Update Parrot Information" : "Register New Parrot"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="p-2 rounded-xl text-text-premium/40 hover:text-text-premium hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold rounded-xl">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name + Slug generator */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Bird Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Charlie"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={autoGenerateSlug}
                    className="px-3 py-2.5 rounded-xl bg-bg-premium dark:bg-[hsl(var(--input-bg))] text-text-premium/70 text-xs font-bold hover:bg-black/[0.04] dark:hover:bg-white/[0.05] border border-black/[0.05] dark:border-[hsl(var(--input-border))] whitespace-nowrap transition-colors"
                  >
                    Slug
                  </button>
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">URL Slug</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. charlie-macaw-baby"
                  className={inputCls}
                />
              </div>

              {/* Species */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Species (Scientific)</label>
                <input type="text" required value={form.species} onChange={(e) => setForm((p) => ({ ...p, species: e.target.value }))} placeholder="e.g. Ara macao" className={inputCls} />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Price ($ USD)</label>
                <input type="number" required value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="e.g. 3500" className={inputCls} />
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Age Details</label>
                <input type="text" required value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} placeholder="e.g. 14 Weeks" className={inputCls} />
              </div>

              {/* Size */}
              <div className="space-y-1">
                <label htmlFor="f-size" className="block text-[10px] font-extrabold uppercase text-text-premium/60">Size Group</label>
                <select id="f-size" value={form.size} onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))} className={selectCls}>
                  <option value="SMALL">Small</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LARGE">Large</option>
                </select>
              </div>

              {/* Sex */}
              <div className="space-y-1">
                <label htmlFor="f-sex" className="block text-[10px] font-extrabold uppercase text-text-premium/60">Sex (DNA)</label>
                <select id="f-sex" value={form.sex} onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value }))} className={selectCls}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNKNOWN">Unknown (Pending DNA)</option>
                </select>
              </div>

              {/* Rarity */}
              <div className="space-y-1">
                <label htmlFor="f-rarity" className="block text-[10px] font-extrabold uppercase text-text-premium/60">Rarity Level</label>
                <select id="f-rarity" value={form.rarity} onChange={(e) => setForm((p) => ({ ...p, rarity: e.target.value }))} className={selectCls}>
                  <option value="COMMON">Common</option>
                  <option value="RARE">Rare</option>
                  <option value="EXCEPTIONAL">Exceptional</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label htmlFor="f-status" className="block text-[10px] font-extrabold uppercase text-text-premium/60">Listing Status</label>
                <select id="f-status" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={selectCls}>
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Sanctuary Origin</label>
                <input type="text" required value={form.origin} onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))} placeholder="e.g. San José Aviary" className={inputCls} />
              </div>

              {/* ── Cover Photo ── full width */}
              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Cover Photo</label>
                  {/* Toggle */}
                  <div className="flex items-center rounded-lg border border-[hsl(var(--card-border))] overflow-hidden text-[10px] font-extrabold">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${
                        imageMode === "url"
                          ? "bg-primary text-white"
                          : "text-text-premium/50 hover:text-text-premium dark:hover:text-white/70"
                      }`}
                    >
                      <Link2 className="h-3 w-3" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("upload")}
                      className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${
                        imageMode === "upload"
                          ? "bg-primary text-white"
                          : "text-text-premium/50 hover:text-text-premium dark:hover:text-white/70"
                      }`}
                    >
                      <Upload className="h-3 w-3" /> Upload
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* Preview */}
                  <div className="h-20 w-20 rounded-xl border border-[hsl(var(--card-border))] overflow-hidden bg-bg-premium/50 shrink-0 flex items-center justify-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-text-premium/20" />
                    )}
                  </div>

                  <div className="flex-1">
                    {imageMode === "url" ? (
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm((p) => ({
                          ...p,
                          imageUrl: e.target.value,
                          imageProvider: "external",
                          imageKey: "",
                          imageFileHash: "",
                        }))}
                        placeholder="https://images.unsplash.com/photo-..."
                        className={inputCls}
                      />
                    ) : (
                      <>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          aria-label="Upload parrot photo"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={isUploading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[hsl(var(--card-border))] text-text-premium/60 text-xs font-bold hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        >
                          <Upload className="h-4 w-4" />
                          {isUploading ? "Uploading..." : "Choose image file"}
                        </button>
                        <p className="text-[10px] text-text-premium/40 mt-1.5 font-semibold">
                          JPG, PNG, WebP, GIF — max 5 MB
                        </p>
                        {form.imageUrl && imageMode === "upload" && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 truncate">
                            ✓ {form.imageUrl}
                          </p>
                        )}
                      </>
                    )}
                    <p className="text-[10px] text-text-premium/35 mt-1.5 font-semibold">
                      {form.imageUrl ? "" : "No image? The app logo will be used as placeholder."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Short Catalog Excerpt</label>
                <input type="text" required value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} placeholder="Summarize key features for grids..." className={inputCls} />
              </div>

              {/* Description */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Full Description</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Detailed biography..." className={`${inputCls} resize-none`} />
              </div>

              {/* Behavior */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Behavioral Notes</label>
                <input type="text" required value={form.behavior} onChange={(e) => setForm((p) => ({ ...p, behavior: e.target.value }))} placeholder="Intelligent, tame, recall trained..." className={inputCls} />
              </div>

              {/* Feeding */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Feeding Regimen</label>
                <input type="text" required value={form.feeding} onChange={(e) => setForm((p) => ({ ...p, feeding: e.target.value }))} placeholder="Harrisons pellets, fresh mango..." className={inputCls} />
              </div>

              {/* Domestication */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Domestication Rearing</label>
                <input type="text" required value={form.domestication} onChange={(e) => setForm((p) => ({ ...p, domestication: e.target.value }))} placeholder="Hand-fed since hatching..." className={inputCls} />
              </div>

              {/* Health Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">Veterinary & Health Notes</label>
                <input type="text" required value={form.healthNotes} onChange={(e) => setForm((p) => ({ ...p, healthNotes: e.target.value }))} placeholder="Negative PCR test panel, microchipped..." className={inputCls} />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                <input
                  id="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-black/[0.08] rounded"
                />
                <label htmlFor="featured" className="text-xs font-bold text-text-premium/80">
                  Feature this bird on Homepage Carousel
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 sm:col-span-2 pt-4 border-t border-[hsl(var(--card-border))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-text-premium/70 dark:text-white/60 text-xs font-bold hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all"
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
