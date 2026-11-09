"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilterBar, { type DogFilterState } from "@/components/features/FilterBar";
import DogCard from "@/components/features/DogCard";
import { Filter, Trash2, Dog as DogIcon, Cat as CatIcon, PawPrint } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Animal } from "@/data/animals";
import { getSpecies } from "@/data/animals";
import type { Breed } from "@/data/breeds";

interface Props {
  initialDogs: Animal[];
  breeds: Breed[];
}

type SpeciesTab = "" | "dog" | "cat";

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

  const initialSpecies = (searchParams.get("species") as SpeciesTab) || "";
  const [species, setSpecies] = useState<SpeciesTab>(
    initialSpecies === "dog" || initialSpecies === "cat" ? initialSpecies : ""
  );

  const [filters, setFilters] = useState<DogFilterState>({
    search: searchParams.get("search") || "",
    breed: searchParams.get("breed") || "",
    sex: searchParams.get("sex") || "",
    size: searchParams.get("size") || "",
    availability: searchParams.get("availability") || "",
    priceOrder: searchParams.get("priceOrder") || "",
    country: searchParams.get("country") || "",
  });

  const countries = useMemo(
    () => [...new Set(initialDogs.map((d) => d.country))].sort(),
    [initialDogs]
  );

  // Breeds shown in the filter follow the active species tab
  const speciesBreeds = useMemo(
    () => breeds.filter((b) => (species ? (b.species ?? "dog") === species : true)),
    [breeds, species]
  );

  const filteredDogs = useMemo(() => {
    let result = initialDogs.filter((d) => (species ? getSpecies(d) === species : true));

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.breedName.toLowerCase().includes(q) ||
          d.breedNameEn.toLowerCase().includes(q)
      );
    }
    if (filters.breed) result = result.filter((d) => d.breed === filters.breed);
    if (filters.sex) result = result.filter((d) => d.sex === filters.sex);
    if (filters.size) result = result.filter((d) => d.size === filters.size);
    if (filters.availability) result = result.filter((d) => d.availability === filters.availability);
    if (filters.country) result = result.filter((d) => d.country === filters.country);

    if (filters.priceOrder === "low-to-high") result = [...result].sort((a, b) => a.price - b.price);
    else if (filters.priceOrder === "high-to-low") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [filters, initialDogs, species]);

  const pushUrl = (nextFilters: DogFilterState, nextSpecies: SpeciesTab) => {
    const params = new URLSearchParams();
    if (nextSpecies) params.set("species", nextSpecies);
    Object.entries(nextFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleFilterChange = (key: keyof DogFilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    pushUrl(updated, species);
  };

  const handleSpecies = (next: SpeciesTab) => {
    setSpecies(next);
    // clear breed when it no longer belongs to the chosen species
    const stillValid = breeds.some(
      (b) => b.slug === filters.breed && (next ? (b.species ?? "dog") === next : true)
    );
    const updated = stillValid ? filters : { ...filters, breed: "" };
    setFilters(updated);
    pushUrl(updated, next);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSpecies("");
    startTransition(() => router.push(pathname, { scroll: false }));
  };

  const tabs: { key: SpeciesTab; label: string; icon: typeof DogIcon }[] = [
    { key: "", label: t("speciesAll"), icon: PawPrint },
    { key: "dog", label: t("speciesDogs"), icon: DogIcon },
    { key: "cat", label: t("speciesCats"), icon: CatIcon },
  ];

  return (
    <div className="space-y-8">
      {/* Species tabs */}
      <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = species === key;
          return (
            <button
              key={key || "all"}
              onClick={() => handleSpecies(key)}
              aria-pressed={active}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white dark:bg-white/[0.05] text-text-premium/70 border border-black/[0.06] dark:border-white/[0.08] hover:border-primary/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <div className="lg:col-span-1">
          <FilterBar
            breeds={speciesBreeds}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            countries={countries}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-white/[0.04] px-4 sm:px-6 py-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
            <p className="text-xs sm:text-sm text-text-premium/70 font-semibold">
              <span>{t("resultsPrefix")} </span>
              <span className="text-primary font-extrabold">{filteredDogs.length}</span>
              <span> {t("resultsSuffix")}</span>
            </p>
            {isPending && (
              <span className="text-xs text-primary font-bold animate-pulse">{t("syncing")}</span>
            )}
          </div>

          {filteredDogs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-text-premium">{t("emptyTitle")}</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {filteredDogs.map((dog) => (
                <div key={dog.id} className="h-full">
                  <DogCard dog={dog} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
