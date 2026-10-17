"use client";

import { Select } from "@/shared/ui";

import { CAR_SORT_OPTIONS, isCarSortId } from "../model/sort-cars";

import { useCatalogNavigation } from "./catalog-navigation";

export function CarSort() {
  const { filters, replaceFilters } = useCatalogNavigation();

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

        replaceFilters({ ...filters, sort });
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
