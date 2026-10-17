"use client";

import { useState } from "react";

import { Button, Checkbox, TextField } from "@/shared/ui";

import { CAR_TYPE_LABELS, type CarType } from "../model/car";
import { activeFilterCount, type CatalogFilters, toggleFilterValue } from "../model/filter-cars";
import { catalogFiltersFromDraft, emptyCatalogFilters } from "../model/parse-catalog-query";

import { useCatalogNavigation } from "./catalog-navigation";

type CarFiltersProps = {
  brands: readonly string[];
  types: readonly CarType[];
};

function useDraftPrice(serverValue: string): readonly [string, (value: string) => void] {
  const [value, setValue] = useState(serverValue);
  const [seen, setSeen] = useState(serverValue);

  if (seen !== serverValue) {
    setSeen(serverValue);
    setValue(serverValue);
  }

  return [value, setValue];
}

function filterStatusLabel(activeCount: number, filtersOpen: boolean): string {
  if (activeCount > 0) {
    return `${activeCount} applied`;
  }

  if (filtersOpen) {
    return "Hide";
  }

  return "Show";
}

export function CarFilters({ brands, types }: CarFiltersProps) {
  const { filters, bounds, replaceFilters } = useCatalogNavigation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useDraftPrice(String(filters.minPrice ?? bounds.min));
  const [maxPrice, setMaxPrice] = useDraftPrice(String(filters.maxPrice ?? bounds.max));
  const activeCount = activeFilterCount(filters, bounds);
  const panelClassName = filtersOpen ? "space-y-6 px-4 py-4" : "space-y-6 px-4 py-4 max-lg:hidden";

  function applyFilters(patch: Partial<CatalogFilters> = {}) {
    replaceFilters(catalogFiltersFromDraft(filters, minPrice, maxPrice, patch));
  }

  return (
    <form
      aria-label="Filter cars"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-4">
        <button
          type="button"
          className="flex min-h-11 w-full cursor-pointer items-center justify-between px-4 py-3 text-left font-medium text-slate-900 lg:hidden"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
        >
          Filters
          <span className="text-sm font-normal text-slate-600">
            {filterStatusLabel(activeCount, filtersOpen)}
          </span>
        </button>
        <div className={panelClassName}>
          <fieldset>
            <legend className="font-medium text-slate-900">Brand</legend>
            <div className="mt-2 space-y-1">
              {brands.map((brand) => (
                <Checkbox
                  key={brand}
                  label={brand}
                  checked={filters.brands.includes(brand)}
                  onChange={(checked) => {
                    applyFilters({ brands: toggleFilterValue(filters.brands, brand, checked) });
                  }}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-medium text-slate-900">Type</legend>
            <div className="mt-2 space-y-1">
              {types.map((type) => (
                <Checkbox
                  key={type}
                  label={CAR_TYPE_LABELS[type]}
                  checked={filters.types.includes(type)}
                  onChange={(checked) => {
                    applyFilters({ types: toggleFilterValue(filters.types, type, checked) });
                  }}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-medium text-slate-900">Price</legend>
            <div className="mt-2 space-y-3">
              <TextField
                id="min-price"
                label="Minimum price"
                type="number"
                inputMode="numeric"
                min={bounds.min}
                max={bounds.max}
                step={1}
                value={minPrice}
                onChange={setMinPrice}
                onBlur={() => applyFilters()}
              />
              <TextField
                id="max-price"
                label="Maximum price"
                type="number"
                inputMode="numeric"
                min={bounds.min}
                max={bounds.max}
                step={1}
                value={maxPrice}
                onChange={setMaxPrice}
                onBlur={() => applyFilters()}
              />
            </div>
          </fieldset>
          <Button onClick={() => replaceFilters(emptyCatalogFilters())}>Clear filters</Button>
        </div>
      </div>
    </form>
  );
}
