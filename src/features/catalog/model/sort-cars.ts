import type { Car } from "./car";

export const CAR_SORT_OPTIONS = [
  { id: "rating-desc", label: "Rating (high to low)" },
  { id: "price-asc", label: "Price (low to high)" },
  { id: "price-desc", label: "Price (high to low)" },
  { id: "year-desc", label: "Year (newest)" },
  { id: "weight-asc", label: "Weight (lightest)" },
] as const;

export type CarSortId = (typeof CAR_SORT_OPTIONS)[number]["id"];

export const DEFAULT_SORT_ID: CarSortId = "rating-desc";

const compareBySort: Record<CarSortId, (left: Car, right: Car) => number> = {
  "rating-desc": (left, right) => right.rating - left.rating,
  "price-asc": (left, right) => left.price - right.price,
  "price-desc": (left, right) => right.price - left.price,
  "year-desc": (left, right) => right.year - left.year,
  "weight-asc": (left, right) => left.weightKg - right.weightKg,
};

export function isCarSortId(value: string): value is CarSortId {
  return CAR_SORT_OPTIONS.some((option) => option.id === value);
}

export function sortCars(source: readonly Car[], sort: CarSortId): Car[] {
  return [...source].sort((left, right) => {
    const bySort = compareBySort[sort](left, right);

    if (bySort !== 0) {
      return bySort;
    }

    const byBrand = left.brand.localeCompare(right.brand);

    if (byBrand !== 0) {
      return byBrand;
    }

    return left.model.localeCompare(right.model);
  });
}
