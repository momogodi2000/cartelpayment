"use client";

import React from "react";
import { Search, RotateCcw, Filter, SlidersHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterState {
  search: string;
  category: string;
  rarity: string;
  size: string;
  status: string;
  priceOrder: string;
}

interface FilterBarProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ categories, filters, onFilterChange, onReset }: FilterBarProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-premium">
            Filter Options
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-text-premium/50 hover:text-primary flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Search Bird
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/45" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder="Name or species..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
          />
        </div>
      </div>

      {/* Category / Species */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Species Group
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">All Species</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rarity */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Rarity Level
        </label>
        <select
          value={filters.rarity}
          onChange={(e) => onFilterChange("rarity", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">All Levels</option>
          <option value="COMMON">Common</option>
          <option value="RARE">Rare</option>
          <option value="EXCEPTIONAL">Exceptional</option>
        </select>
      </div>

      {/* Size */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Parrot Size
        </label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange("size", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">All Sizes</option>
          <option value="SMALL">Small</option>
          <option value="MEDIUM">Medium</option>
          <option value="LARGE">Large</option>
        </select>
      </div>

      {/* Availability Status */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Availability Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="SOLD">Sold</option>
        </select>
      </div>

      {/* Price Sorting */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          Sort by Price
        </label>
        <select
          value={filters.priceOrder}
          onChange={(e) => onFilterChange("priceOrder", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">Default Order</option>
          <option value="low-to-high">Low to High</option>
          <option value="high-to-low">High to Low</option>
        </select>
      </div>
    </div>
  );
}
