"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeft, Search, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { createBlogPost, updateBlogPost, deleteBlogPost } from "@/actions/blog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date | string;
}

interface BlogClientProps {
  initialPosts: BlogPost[];
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "Care Guide",
  tagsString: "",
  published: false,
  seoTitle: "",
  seoDescription: "",
};

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      category: p.category,
      tagsString: p.tags.join(", "),
      published: p.published,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
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
    if (!confirm("Are you sure you want to delete this article?")) return;
    const res = await deleteBlogPost(id);
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert(res.error || "Failed to delete.");
    }
  };

  const handleTogglePublish = async (p: BlogPost) => {
    const nextState = !p.published;
    
    // Optimistic Update
    setPosts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, published: nextState } : item))
    );

    const payload = {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      category: p.category,
      tags: p.tags,
      published: nextState,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    };

    const res = await updateBlogPost(p.id, payload);
    if (!res.success) {
      alert("Failed to change publish status. Reverting...");
      setPosts(posts); // revert
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const tagsArr = form.tagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage,
      category: form.category,
      tags: tagsArr,
      published: form.published,
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.excerpt,
    };

    if (editingId) {
      const res = await updateBlogPost(editingId, payload);
      if (res.success) {
        setPosts((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...payload, tags: tagsArr } : item
          )
        );
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to save.");
      }
    } else {
      const res = await createBlogPost(payload);
      if (res.success && res.post) {
        setPosts((prev) => [res.post as BlogPost, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrors(res.error || "Failed to create.");
      }
    }
    setIsSubmitting(false);
  };

  const autoGenerateSlug = () => {
    const slugified = form.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((prev) => ({ ...prev, slug: slugified }));
  };

  return (
    <div className="space-y-6">
      {/* Action Row */}
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
          <Plus className="h-4 w-4" /> Write New Article
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-black/[0.04] shadow-sm max-w-md">
        <Search className="h-4 w-4 text-text-premium/40 mr-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by title or category..."
          className="outline-none bg-transparent text-xs w-full"
        />
      </div>

      {/* Grid listing */}
      <div className="bg-white rounded-3xl border border-black/[0.05] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-bg-premium/50 border-b border-black/[0.04]">
              <th className="px-6 py-4 font-bold text-text-premium/60">Article details</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Category</th>
              <th className="px-6 py-4 font-bold text-text-premium/60">Status</th>
              <th className="px-6 py-4 font-bold text-text-premium/60 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-text-premium/40 font-semibold">
                  No articles found. Write one to populate the blog.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-black/[0.03] hover:bg-bg-premium/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-extrabold text-sm text-text-premium block">{p.title}</span>
                      <span className="text-[10px] text-text-premium/40 block">
                        Published: {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-bg-premium border border-black/[0.04] text-[10px] font-bold text-text-premium/70 uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      className="flex items-center gap-1.5 focus:outline-none"
                      title="Toggle published status"
                    >
                      {p.published ? (
                        <span className="text-emerald-600 font-extrabold text-[10px] flex items-center gap-1">
                          <ToggleRight className="h-5 w-5 text-emerald-600" /> Published
                        </span>
                      ) : (
                        <span className="text-text-premium/40 font-bold text-[10px] flex items-center gap-1">
                          <ToggleLeft className="h-5 w-5 text-text-premium/30" /> Draft
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${p.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-text-premium/50 hover:text-primary hover:bg-black/[0.02]"
                        title="Preview article"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit article"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-text-premium/50 hover:text-red-600 hover:bg-red-50"
                        title="Delete article"
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

      {/* Writing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-black/[0.08] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative text-left">
            <h2 className="text-xl font-extrabold text-text-premium">
              {editingId ? "Edit Article Details" : "Write New Care Article"}
            </h2>

            {errors && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                {errors}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Article Title
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Diet requirements for macaws"
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
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. diet-requirements-for-macaws"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Category
                </label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Health, Domestication, Training"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tagsString}
                  onChange={(e) => setForm((prev) => ({ ...prev, tagsString: e.target.value }))}
                  placeholder="e.g. nutrition, macaw, guide"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  required
                  value={form.coverImage}
                  onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Excerpt Summary
                </label>
                <input
                  type="text"
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Summarize article context..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Content body */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  Article Body (HTML/Markdown supported)
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="<p>Full article paragraph here...</p>"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none resize-none font-mono"
                />
              </div>

              {/* SEO Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  SEO Tag Title
                </label>
                <input
                  type="text"
                  value={form.seoTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="Search engine title..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* SEO Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase text-text-premium/60">
                  SEO Meta Description
                </label>
                <input
                  type="text"
                  value={form.seoDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Search engine brief..."
                  className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] text-xs outline-none"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                <input
                  id="published"
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                  className="h-4 w-4 text-primary focus:ring-primary border-black/[0.08] rounded"
                />
                <label htmlFor="published" className="text-xs font-bold text-text-premium/80">
                  Publish this article immediately (visible on Blog catalog)
                </label>
              </div>

              {/* Action Buttons */}
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
                  {isSubmitting ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
