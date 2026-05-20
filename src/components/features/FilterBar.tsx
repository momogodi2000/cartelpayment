"use client";

import React from "react";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/context/AppContext";

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
  const { language } = useApp();

  const getCategoryName = (name: string) => {
    if (language === "en") return name;
    if (name.toLowerCase() === "macaws") return "Aras";
    if (name.toLowerCase() === "cockatoos") return "Cacatoès";
    if (name.toLowerCase() === "amazons") return "Amazones";
    return name;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-black/[0.06] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-text-premium">
            {language === "en" ? "Filter Options" : "Options de filtrage"}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-text-premium/50 hover:text-primary flex items-center gap-1 transition-colors"
          title={language === "en" ? "Reset all filters" : "Réinitialiser tous les filtres"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {language === "en" ? "Reset" : "Réinitialiser"}
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Search Bird" : "Rechercher"}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/45" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            placeholder={language === "en" ? "Name or species..." : "Nom ou espèce..."}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-black/[0.08] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-xs"
          />
        </div>
      </div>

      {/* Category / Species */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Species Group" : "Groupe d'espèces"}
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">{language === "en" ? "All Species" : "Toutes les espèces"}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {getCategoryName(cat.name)}
            </option>
          ))}
        </select>
      </div>

      {/* Rarity */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Rarity Level" : "Niveau de rareté"}
        </label>
        <select
          value={filters.rarity}
          onChange={(e) => onFilterChange("rarity", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">{language === "en" ? "All Levels" : "Tous les niveaux"}</option>
          <option value="COMMON">{language === "en" ? "Common" : "Commun"}</option>
          <option value="RARE">{language === "en" ? "Rare" : "Rare"}</option>
          <option value="EXCEPTIONAL">{language === "en" ? "Exceptional" : "Exceptionnel"}</option>
        </select>
      </div>

      {/* Size */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Parrot Size" : "Taille du perroquet"}
        </label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange("size", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">{language === "en" ? "All Sizes" : "Toutes les tailles"}</option>
          <option value="SMALL">{language === "en" ? "Small" : "Petite"}</option>
          <option value="MEDIUM">{language === "en" ? "Medium" : "Moyenne"}</option>
          <option value="LARGE">{language === "en" ? "Large" : "Grande"}</option>
        </select>
      </div>

      {/* Availability Status */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Availability Status" : "Statut de disponibilité"}
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">{language === "en" ? "All Statuses" : "Tous les statuts"}</option>
          <option value="AVAILABLE">{language === "en" ? "Available" : "Disponible"}</option>
          <option value="RESERVED">{language === "en" ? "Reserved" : "Réservé"}</option>
          <option value="SOLD">{language === "en" ? "Sold" : "Vendu"}</option>
        </select>
      </div>

      {/* Price Sorting */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-premium/70 uppercase tracking-wider">
          {language === "en" ? "Sort by Price" : "Trier par prix"}
        </label>
        <select
          value={filters.priceOrder}
          onChange={(e) => onFilterChange("priceOrder", e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-black/[0.08] bg-white outline-none focus:border-primary transition-all text-xs"
        >
          <option value="">{language === "en" ? "Default Order" : "Ordre par défaut"}</option>
          <option value="low-to-high">{language === "en" ? "Low to High" : "Du moins cher au plus cher"}</option>
          <option value="high-to-low">{language === "en" ? "High to Low" : "Du plus cher au moins cher"}</option>
        </select>
      </div>
    </div>
  );
}
