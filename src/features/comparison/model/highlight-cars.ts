import type { Car } from "@/features/catalog";

export const COMPARISON_ROWS = [
  { key: "price", label: "Price", highlight: "lowest" },
  { key: "brand", label: "Brand", highlight: null },
  { key: "model", label: "Model", highlight: null },
  { key: "year", label: "Year", highlight: "highest" },
  { key: "type", label: "Type", highlight: null },
  { key: "weightKg", label: "Weight", highlight: "lowest" },
  { key: "rating", label: "Rating", highlight: "highest" },
  { key: "horsepower", label: "Horsepower", highlight: "highest" },
  { key: "fuelType", label: "Fuel", highlight: null },
  { key: "transmission", label: "Transmission", highlight: null },
  { key: "drivetrain", label: "Drivetrain", highlight: null },
  { key: "seats", label: "Seats", highlight: null },
] as const;

export type ComparisonRowKey = (typeof COMPARISON_ROWS)[number]["key"];
export type ComparisonHighlight = "lowest" | "highest";

export const COMPARISON_HIGHLIGHT_PHRASES = {
  price: "Lowest price",
  weightKg: "Lowest weight",
  rating: "Highest rating",
  horsepower: "Highest horsepower",
  year: "Newest year",
} as const;

export type ComparisonHighlightKey = keyof typeof COMPARISON_HIGHLIGHT_PHRASES;

export function isComparisonHighlightKey(key: ComparisonRowKey): key is ComparisonHighlightKey {
  return key in COMPARISON_HIGHLIGHT_PHRASES;
}

export function getHighlightedCarIds(
  source: readonly Car[],
  key: ComparisonHighlightKey,
  direction: ComparisonHighlight,
): string[] {
  if (source.length === 0) {
    return [];
  }

  const values = source.map((car) => car[key]);
  const target = direction === "lowest" ? Math.min(...values) : Math.max(...values);

  return source.filter((car) => car[key] === target).map((car) => car.id);
}

export function highlightedIdsFor(
  cars: readonly Car[],
  key: ComparisonRowKey,
  highlight: ComparisonHighlight | null,
): string[] {
  if (cars.length < 2 || highlight === null || !isComparisonHighlightKey(key)) {
    return [];
  }

  return getHighlightedCarIds(cars, key, highlight);
}
