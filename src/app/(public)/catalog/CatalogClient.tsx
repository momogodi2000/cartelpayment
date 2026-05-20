"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilterBar from "@/components/features/FilterBar";
import ParrotCard from "@/components/features/ParrotCard";
import { Filter, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useTranslation } from "@/lib/translations";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ParrotImage {
  url: string;
  alt: string;
}

interface Parrot {
  id: string;
  name: string;
  slug: string;
  species: string;
  shortDescription: string;
  price: number;
  status: string;
  rarity: string;
  origin: string;
  size: string;
  images: ParrotImage[];
}

interface CatalogClientProps {
  initialParrots: Parrot[];
  categories: Category[];
}

interface FilterState {
  search: string;
  category: string;
  rarity: string;
  size: string;
  status: string;
  priceOrder: string;
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  category: "",
  rarity: "",
  size: "",
  status: "",
  priceOrder: "",
};

export default function CatalogClient({ initialParrots, categories }: CatalogClientProps) {
  const { language } = useApp();
  const { t } = useTranslation(language);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1. Initialize filter state from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    rarity: searchParams.get("rarity") || "",
    size: searchParams.get("size") || "",
    status: searchParams.get("status") || "",
    priceOrder: searchParams.get("priceOrder") || "",
  });

  // 2. Perform dynamic filtering & sorting inline via useMemo
  const filteredParrots = React.useMemo(() => {
    let result = [...initialParrots];

    // Search Filter (Name and Species)
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (bird) =>
          bird.name.toLowerCase().includes(query) || bird.species.toLowerCase().includes(query)
      );
    }

    // Category / Species Group Filter
    if (filters.category) {
      const catObj = categories.find((c) => c.slug === filters.category);
      if (catObj) {
        const matchName = catObj.name.toLowerCase();
        result = result.filter(
          (bird) =>
            bird.name.toLowerCase().includes(matchName) ||
            bird.species.toLowerCase().includes(matchName)
        );
      }
    }

    // Rarity Filter
    if (filters.rarity) {
      result = result.filter((bird) => bird.rarity === filters.rarity);
    }

    // Size Filter
    if (filters.size) {
      result = result.filter((bird) => bird.size === filters.size);
    }

    // Status Filter
    if (filters.status) {
      result = result.filter((bird) => bird.status === filters.status);
    }

    // Price Sorting
    if (filters.priceOrder === "low-to-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.priceOrder === "high-to-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [filters, initialParrots, categories]);

  // 3. Update URL search parameters to maintain sync
  const updateUrl = (updatedFilters: FilterState) => {
    const params = new URLSearchParams();
    
    Object.entries(updatedFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
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
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <FilterBar
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Catalog Grid */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-white/[0.04] px-6 py-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
          <p className="text-xs sm:text-sm text-text-premium/70 font-semibold">
            <span>{t("catalog.countPrefix")} </span>
            <span className="text-primary font-extrabold">{filteredParrots.length}</span>
            <span> {t("catalog.countSuffix")}</span>
          </p>
          {isPending && (
            <span className="text-xs text-primary font-bold animate-pulse">
              {t("catalog.syncing")}
            </span>
          )}
        </div>

        {filteredParrots.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-white/[0.04] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="font-extrabold text-lg text-text-premium">
              {t("catalog.emptyTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-text-premium/60 max-w-sm mx-auto leading-relaxed">
              {t("catalog.emptyBody")}
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Trash2 className="h-4 w-4" /> {t("catalog.resetFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParrots.map((parrot) => (
              <div key={parrot.id} className="h-full">
                <ParrotCard parrot={parrot} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
