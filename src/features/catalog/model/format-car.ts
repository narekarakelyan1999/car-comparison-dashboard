import { type Car, CAR_TYPE_LABELS } from "./car";
import type { CatalogFilters, PriceBounds } from "./filter-cars";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("en-US");

export function formatPrice(price: number): string {
  return usdFormatter.format(price);
}

export function formatWeight(weightKg: number): string {
  return `${integerFormatter.format(weightKg)} kg`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatHorsepower(horsepower: number): string {
  return `${horsepower} hp`;
}

export function formatCarTitle(car: Car): string {
  return `${car.year} ${car.brand} ${car.model}`;
}

export function formatCarCount(count: number): string {
  if (count === 1) {
    return "1 car";
  }

  return `${count} cars`;
}

export function catalogResultLabel(
  pageCount: number,
  rangeStart: number,
  rangeEnd: number,
  total: number,
): string {
  if (pageCount > 1) {
    return `Showing ${rangeStart}–${rangeEnd} of ${formatCarCount(total)}`;
  }

  return formatCarCount(total);
}

export function formatAppliedFilters(filters: CatalogFilters, bounds: PriceBounds): string | null {
  const parts: string[] = [];

  if (filters.brands.length > 0) {
    parts.push(filters.brands.join(", "));
  }

  if (filters.types.length > 0) {
    parts.push(filters.types.map((type) => CAR_TYPE_LABELS[type]).join(", "));
  }

  const hasMin = filters.minPrice !== null && filters.minPrice > bounds.min;
  const hasMax = filters.maxPrice !== null && filters.maxPrice < bounds.max;

  if (hasMin && hasMax && filters.minPrice !== null && filters.maxPrice !== null) {
    parts.push(`${formatPrice(filters.minPrice)}–${formatPrice(filters.maxPrice)}`);
  } else if (hasMin && filters.minPrice !== null) {
    parts.push(`From ${formatPrice(filters.minPrice)}`);
  } else if (hasMax && filters.maxPrice !== null) {
    parts.push(`Up to ${formatPrice(filters.maxPrice)}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" · ");
}
