import { type Car, CAR_TYPES, type CarType } from "./car";
import type { CarSortId } from "./sort-cars";

export type CatalogFilters = {
  brands: string[];
  types: CarType[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: CarSortId;
};

export type PriceBounds = {
  min: number;
  max: number;
};

export function listBrands(source: readonly Car[]): string[] {
  return [...new Set(source.map((car) => car.brand))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function listCarTypes(source: readonly Car[]): CarType[] {
  const present = new Set(source.map((car) => car.type));

  return CAR_TYPES.filter((type) => present.has(type));
}

export function priceBounds(source: readonly Car[]): PriceBounds {
  if (source.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = source.map((car) => car.price);

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export function toggleFilterValue<T extends string>(
  current: readonly T[],
  value: T,
  checked: boolean,
): T[] {
  if (!checked) {
    return current.filter((item) => item !== value);
  }

  if (current.includes(value)) {
    return [...current];
  }

  return [...current, value];
}

export function activeFilterCount(filters: CatalogFilters, bounds: PriceBounds): number {
  const minActive = filters.minPrice !== null && filters.minPrice > bounds.min ? 1 : 0;
  const maxActive = filters.maxPrice !== null && filters.maxPrice < bounds.max ? 1 : 0;

  return filters.brands.length + filters.types.length + minActive + maxActive;
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.brands.length > 0 ||
    filters.types.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null
  );
}

function matchesFilter(car: Car, filters: CatalogFilters, bounds: PriceBounds): boolean {
  const minPrice = filters.minPrice ?? bounds.min;
  const maxPrice = filters.maxPrice ?? bounds.max;
  const matchesBrand = filters.brands.length === 0 || filters.brands.includes(car.brand);
  const matchesType = filters.types.length === 0 || filters.types.includes(car.type);
  const matchesPrice = car.price >= minPrice && car.price <= maxPrice;

  return matchesBrand && matchesType && matchesPrice;
}

export function filterCars(
  source: readonly Car[],
  filters: CatalogFilters,
  bounds: PriceBounds,
): Car[] {
  return source.filter((car) => matchesFilter(car, filters, bounds));
}
