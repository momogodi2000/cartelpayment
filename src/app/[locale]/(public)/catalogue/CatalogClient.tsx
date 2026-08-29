"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilterBar, { type DogFilterState } from "@/components/features/FilterBar";
import DogCard from "@/components/features/DogCard";
import { Filter, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Dog } from "@/data/dogs";
import type { Breed } from "@/data/breeds";

interface Props {
  initialDogs: Dog[];
  breeds: Breed[];
}

const DEFAULT_FILTERS: DogFilterState = {
  search: "",
  breed: "",
  sex: "",
  size: "",
  availability: "",
  priceOrder: "",
  country: "",
};

export default function CatalogClient({ initialDogs, breeds }: Props) {
  const t = useTranslations("Catalogue");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<DogFilterState>({
    search: searchParams.get("search") || "",
    breed: searchParams.get("breed") || "",
    sex: searchParams.get("sex") || "",
    size: searchParams.get("size") || "",
    availability: searchParams.get("availability") || "",
    priceOrder: searchParams.get("priceOrder") || "",
    country: searchParams.get("country") || "",
  });

  // Derive unique countries from data
  const countries = useMemo(
    () => [...new Set(initialDogs.map((d) => d.country))].sort(),
    [initialDogs]
  );

  // Frontend filtering + sorting
  const filteredDogs = useMemo(() => {
    let result = [...initialDogs];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.breedName.toLowerCase().includes(q) ||
          d.breedNameEn.toLowerCase().includes(q)
      );
    }

    if (filters.breed) {
      result = result.filter((d) => d.breed === filters.breed);
    }

    if (filters.sex) {
      result = result.filter((d) => d.sex === filters.sex);
    }

    if (filters.size) {
      result = result.filter((d) => d.size === filters.size);
    }

    if (filters.availability) {
      result = result.filter((d) => d.availability === filters.availability);
    }

    if (filters.country) {
      result = result.filter((d) => d.country === filters.country);
    }

    if (filters.priceOrder === "low-to-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.priceOrder === "high-to-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [filters, initialDogs]);

  const updateUrl = (updated: DogFilterState) => {
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([k, v]) => { if (v) params.set(k, v); });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleFilterChange = (key: keyof DogFilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    updateUrl(updated);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
      {/* Filters */}
      <div className="lg:col-span-1">
        <FilterBar
          breeds={breeds}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          countries={countries}
        />
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-white/[0.04] px-6 py-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs sm:text-sm text-text-premium/70 font-semibold">
            <span>{t("resultsPrefix")} </span>
            <span className="text-primary font-extrabold">{filteredDogs.length}</span>
            <span> {t("resultsSuffix")}</span>
          </p>
          {isPending && (
            <span className="text-xs text-primary font-bold animate-pulse">
              {t("syncing")}
            </span>
          )}
        </div>

        {filteredDogs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg text-text-premium">
              {t("emptyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-text-premium/60 max-w-sm mx-auto leading-relaxed">
              {t("emptyBody")}
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {t("resetFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDogs.map((dog) => (
              <div key={dog.id} className="h-full">
                <DogCard dog={dog} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
