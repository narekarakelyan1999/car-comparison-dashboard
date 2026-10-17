"use client";

import { useRouter } from "next/navigation";

import { Select } from "@/shared/ui";

import type { CatalogFilters, PriceBounds } from "../model/filter-cars";
import { catalogQueryHref } from "../model/parse-catalog-query";
import { CAR_SORT_OPTIONS, isCarSortId } from "../model/sort-cars";

type CarSortProps = {
  filters: CatalogFilters;
  bounds: PriceBounds;
  comparisonIds: readonly string[];
};

export function CarSort({ filters, bounds, comparisonIds }: CarSortProps) {
  const router = useRouter();

  return (
    <Select
      id="car-sort"
      label="Sort"
      className="sm:min-w-56"
      value={filters.sort}
      onChange={(event) => {
        const sort = event.target.value;

        if (!isCarSortId(sort)) {
          return;
        }

        router.replace(catalogQueryHref({ ...filters, sort }, comparisonIds, bounds), {
          scroll: false,
        });
      }}
    >
      {CAR_SORT_OPTIONS.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
