"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Search, Camera, Video, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/actions/gallery";

interface GalleryItem {
  id: string;
  title: string;
  type: "IMAGE" | "VIDEO" | any;
  url: string;
  caption: string;
  category: string;
  order: number;
}

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

const emptyForm = {
  title: "",
  type: "IMAGE",
  url: "",
  caption: "",
  category: "Nursery",
  order: "0",
};

export default function GalleryClient({ initialItems }: GalleryClientProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      type: item.type,
      url: item.url,
      caption: item.caption,
      category: item.category,
      order: item.order.toString(),
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
    if (!confirm("Are you sure you want to delete this media item?")) return;
    const res = await deleteGalleryItem(id);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert(res.error || "Failed to delete.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const orderNum = parseInt(form.order, 10);
    if (isNaN(orderNum)) {
      setErrors("Please specify a valid sorting order number.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: form.title,
      type: form.type as any,
      url: form.url,
      caption: form.caption,
      category: form.category,
      order: orderNum,
    };

    if (editingId) {
      const res = await updateGalleryItem(editingId, payload);
      if (res.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        );
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to save.");
      }
    } else {
      const res = await createGalleryItem(payload);
      if (res.success && res.item) {
        setItems((prev) => [res.item as any, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to create.");
      }
    }
    setIsSubmitting(false);
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
          <Plus className="h-4 w-4" /> Add Gallery Media
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-black/[0.04] shadow-sm max-w-md">
        <Search className="h-4 w-4 text-text-premium/40 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category tag..."
          className="outline-none bg-transparent text-xs w-full"
        />
      </div>

      {/* Listing Grid */}
      <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-bg-premium/50 border-b border-black/[0.04]">
              <th className="px-6 py-4 font-bold text-text-premium/60">Preview</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Details</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Category</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Order</th>
              <th className="px-6 py-4 font-bold text-text-premium/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-text-premium/40 font-semibold">
                  No media items. Add one to show on gallery pages.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-black/[0.03] hover:bg-bg-premium/30 transition-colors">
                  <td className="px-6 py-4 w-24">
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden border border-black/[0.06] bg-bg-premium">
                      <Image
                        src={item.url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-extrabold text-sm text-text-premium block">{item.title}</span>
                      <span className="text-[10px] text-text-premium/50 block line-clamp-1">
                        {item.caption}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-bg-premium border border-black/[0.04] text-[10px] font-bold text-text-premium/70 uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-text-premium/70">
                    {item.order}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-red-600 hover:bg-red-50"
                        title="Delete media"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-black/[0.08] shadow-2xl space-y-6 relative text-left">
            <h2 className="text-xl font-extrabold text-text-premium">
              {editingId ? "Update Media Info" : "Register Gallery Asset"}
            </h2>

            {errors && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Media Title
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Nursery Incubator Unit"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Media Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="IMAGE">Image file</option>
                  <option value="VIDEO">Video reference</option>
                </select>
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Source URL
                </label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Caption Description
                </label>
                <input
                  type="text"
                  required
                  value={form.caption}
                  onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder="Short description for visitors..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Category Tag
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white text-xs outline-none"
                >
                  <option value="Nursery">Nursery</option>
                  <option value="Facility">Facility</option>
                  <option value="Socialization">Socialization</option>
                  <option value="Nutrition">Nutrition</option>
                  <option value="Tamed Birds">Tamed Birds</option>
                </select>
              </div>

              {/* Order */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Sorting Order Weight
                </label>
                <input
                  type="number"
                  required
                  value={form.order}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                  placeholder="e.g. 0, 1, 2"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.04]">
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
                  {isSubmitting ? "Saving..." : "Save Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
