import {
  type Car,
  CAR_TYPE_LABELS,
  DRIVETRAIN_LABELS,
  formatCarTitle,
  formatHorsepower,
  formatPrice,
  formatRating,
  formatWeight,
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
} from "@/features/catalog";

import {
  COMPARISON_HIGHLIGHT_PHRASES,
  COMPARISON_ROWS,
  type ComparisonRowKey,
  highlightedIdsFor,
  isComparisonHighlightKey,
} from "./highlight-cars";
import { MIN_COMPARISON_CARS } from "./selection";

export type ComparisonTableCell = {
  carId: string;
  value: string;
  isBest: boolean;
};

export type ComparisonTableRow = {
  key: ComparisonRowKey;
  label: string;
  phrase: string | null;
  cells: ComparisonTableCell[];
};

export function buildComparisonRows(cars: readonly Car[]): ComparisonTableRow[] {
  return COMPARISON_ROWS.map((row) => {
    const highlightedIds = highlightedIdsFor(cars, row.key, row.highlight);
    const phrase = isComparisonHighlightKey(row.key) ? COMPARISON_HIGHLIGHT_PHRASES[row.key] : null;

    return {
      key: row.key,
      label: row.label,
      phrase,
      cells: cars.map((car) => ({
        carId: car.id,
        value: formatComparisonValue(car, row.key),
        isBest: highlightedIds.includes(car.id),
      })),
    };
  });
}

export function comparisonCarOptions(cars: readonly Car[]): { id: string; label: string }[] {
  return cars
    .map((car) => ({ id: car.id, label: formatCarTitle(car) }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function formatComparisonValue(car: Car, key: ComparisonRowKey): string {
  switch (key) {
    case "price":
      return formatPrice(car.price);
    case "weightKg":
      return formatWeight(car.weightKg);
    case "rating":
      return formatRating(car.rating);
    case "horsepower":
      return formatHorsepower(car.horsepower);
    case "year":
      return String(car.year);
    case "seats":
      return String(car.seats);
    case "brand":
      return car.brand;
    case "model":
      return car.model;
    case "type":
      return CAR_TYPE_LABELS[car.type];
    case "fuelType":
      return FUEL_TYPE_LABELS[car.fuelType];
    case "transmission":
      return TRANSMISSION_LABELS[car.transmission];
    case "drivetrain":
      return DRIVETRAIN_LABELS[car.drivetrain];
    default: {
      const exhaustive: never = key;

      return exhaustive;
    }
  }
}

export function formatRemovedCarCount(count: number): string {
  if (count === 1) {
    return "1 selected car was removed because it is not in the catalog.";
  }

  return `${count} selected cars were removed because they are not in the catalog.`;
}

export function comparisonTitle(cars: readonly Car[]): string {
  if (cars.length < MIN_COMPARISON_CARS) {
    return "Compare cars";
  }

  return `Compare ${cars.map((car) => `${car.brand} ${car.model}`).join(" vs ")}`;
}
