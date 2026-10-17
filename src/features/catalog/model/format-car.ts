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

function appliedPriceLabel(filters: CatalogFilters, bounds: PriceBounds): string | null {
  const minPrice =
    filters.minPrice !== null && filters.minPrice > bounds.min ? filters.minPrice : null;
  const maxPrice =
    filters.maxPrice !== null && filters.maxPrice < bounds.max ? filters.maxPrice : null;

  if (minPrice !== null && maxPrice !== null) {
    return `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`;
  }

  if (minPrice !== null) {
    return `From ${formatPrice(minPrice)}`;
  }

  if (maxPrice !== null) {
    return `Up to ${formatPrice(maxPrice)}`;
  }

  return null;
}

export function formatAppliedFilters(filters: CatalogFilters, bounds: PriceBounds): string | null {
  const priceLabel = appliedPriceLabel(filters, bounds);
  const parts = [
    filters.brands.join(", "),
    filters.types.map((type) => CAR_TYPE_LABELS[type]).join(", "),
    priceLabel ?? "",
  ].filter((part) => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" · ");
}
