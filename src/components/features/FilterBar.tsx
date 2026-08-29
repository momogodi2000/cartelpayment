"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";
import type { Breed } from "@/data/breeds";

export interface DogFilterState {
  search: string;
  breed: string;
  sex: string;
  size: string;
  availability: string;
  priceOrder: string;
  country: string;
}

interface Props {
  breeds: Breed[];
  filters: DogFilterState;
  onFilterChange: (key: keyof DogFilterState, value: string) => void;
  onReset: () => void;
  countries: string[];
}

export default function FilterBar({ breeds, filters, onFilterChange, onReset, countries }: Props) {
  const { language } = useApp();
  const { t } = useTranslation(language);

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  const labelClass = "block text-xs font-bold text-text-premium/60 uppercase tracking-wider mb-1.5";
  const selectClass = "w-full px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-black/10 text-sm font-semibold text-text-premium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const inputClass = "w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-white dark:bg-black/10 text-sm font-semibold text-text-premium placeholder:text-text-premium/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <div className="bg-white dark:bg-black/10 rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm p-6 space-y-5 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-extrabold text-text-premium">{t("filter.title")}</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("filter.reset")}
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className={labelClass}>{t("filter.search")}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-premium/40 pointer-events-none" />
          <input
            type="text"
            placeholder={t("filter.search")}
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Breed */}
      <div>
        <label className={labelClass}>{t("filter.breed")}</label>
        <select
          value={filters.breed}
          onChange={(e) => onFilterChange("breed", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("filter.allBreeds")}</option>
          {breeds.map((b) => (
            <option key={b.slug} value={b.slug}>
              {language === "en" ? b.nameEn : b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sex */}
      <div>
        <label className={labelClass}>{t("filter.sex")}</label>
        <select
          value={filters.sex}
          onChange={(e) => onFilterChange("sex", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("filter.allSexes")}</option>
          <option value="male">{t("filter.male")}</option>
          <option value="femelle">{t("filter.female")}</option>
        </select>
      </div>

      {/* Size */}
      <div>
        <label className={labelClass}>{t("filter.size")}</label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange("size", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("filter.allSizes")}</option>
          <option value="petit">{t("filter.small")}</option>
          <option value="moyen">{t("filter.medium")}</option>
          <option value="grand">{t("filter.large")}</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className={labelClass}>{t("filter.availability")}</label>
        <select
          value={filters.availability}
          onChange={(e) => onFilterChange("availability", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("filter.allStatuses")}</option>
          <option value="disponible">{t("filter.available")}</option>
          <option value="réservé">{t("filter.reserved")}</option>
        </select>
      </div>

      {/* Country */}
      {countries.length > 0 && (
        <div>
          <label className={labelClass}>{t("filter.country")}</label>
          <select
            value={filters.country}
            onChange={(e) => onFilterChange("country", e.target.value)}
            className={selectClass}
          >
            <option value="">{t("filter.allCountries")}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price Order */}
      <div>
        <label className={labelClass}>{t("filter.priceOrder")}</label>
        <select
          value={filters.priceOrder}
          onChange={(e) => onFilterChange("priceOrder", e.target.value)}
          className={selectClass}
        >
          <option value="">{t("filter.newest")}</option>
          <option value="low-to-high">{t("filter.lowToHigh")}</option>
          <option value="high-to-low">{t("filter.highToLow")}</option>
        </select>
      </div>
    </div>
  );
}
