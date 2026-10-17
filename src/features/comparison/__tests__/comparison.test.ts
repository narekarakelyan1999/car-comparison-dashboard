import { describe, expect, it } from "vitest";

import type { Car } from "@/features/catalog";

import { comparisonApi } from "../api/comparison-api";
import {
  comparisonCarOptions,
  comparisonTitle,
  formatComparisonValue,
  formatRemovedCarCount,
} from "../model/format-comparison";
import { getHighlightedCarIds, highlightedIdsFor } from "../model/highlight-cars";
import { parseCompareIds } from "../model/parse-compare-ids";
import {
  compareHref,
  isSelectionDisabled,
  MAX_COMPARISON_CARS,
  nextSelectionHref,
  toggleComparisonId,
} from "../model/selection";

function sampleCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car",
    brand: "Honda",
    model: "Civic",
    year: 2024,
    type: "suv",
    price: 30000,
    weightKg: 1500,
    rating: 4,
    reviewCount: 10,
    horsepower: 200,
    fuelType: "electric",
    transmission: "automatic",
    drivetrain: "awd",
    seats: 5,
    imageSrc: "/cars/car.png",
    imageAlt: "Example car",
    ...overrides,
  };
}

describe("parseCompareIds", () => {
  it("trims values, drops empty segments, keeps the first duplicate, and stops at the limit", () => {
    expect(parseCompareIds(" a, a, ,b ,c,d ", MAX_COMPARISON_CARS)).toEqual(["a", "b", "c"]);
    expect(parseCompareIds(undefined, MAX_COMPARISON_CARS)).toEqual([]);
  });
});

describe("comparison selection", () => {
  it("appends a car, removes a selected car, and refuses a fourth car", () => {
    const added = toggleComparisonId(["a"], "b");
    const removed = toggleComparisonId(["a", "b"], "a");
    const full = ["a", "b", "c"];

    expect(added).toEqual(["a", "b"]);
    expect(removed).toEqual(["b"]);
    expect(toggleComparisonId(full, "d")).toBe(full);
    expect(isSelectionDisabled(full, "d")).toBe(true);
    expect(isSelectionDisabled(full, "a")).toBe(false);
  });

  it("builds the compare link and the next catalog link from known cars only", () => {
    expect(compareHref([])).toBe("/compare");
    expect(compareHref(["toyota-camry", "bmw-i4"])).toBe("/compare?ids=toyota-camry,bmw-i4");
    expect(
      nextSelectionHref(
        "/",
        "compare",
        "compare=fake1,fake2,fake3&brand=toyota",
        "toyota-camry",
        [],
      ),
    ).toBe("/?compare=toyota-camry&brand=toyota");
    expect(nextSelectionHref("/", "compare", "compare=a,b,c", "d", ["a", "b", "c"])).toBeNull();
    expect(
      nextSelectionHref("/", "compare", "compare=toyota-camry", "toyota-camry", ["toyota-camry"]),
    ).toBe("/");
    expect(
      nextSelectionHref("/", "compare", "compare=toyota-camry&brand=toyota", "toyota-camry", [
        "toyota-camry",
      ]),
    ).toBe("/?brand=toyota");
    expect(
      comparisonApi.listFromCatalog({ compare: "toyota-camry" }).cars.map((car) => car.id),
    ).toEqual(["toyota-camry"]);
  });

  it("keeps known cars and reports ids that are not in the catalog", () => {
    const result = comparisonApi.listFromPage({ ids: "nope,toyota-camry,nope" });

    expect(result.cars.map((car) => car.id)).toEqual(["toyota-camry"]);
    expect(result.unknownIds).toEqual(["nope"]);
  });
});

describe("highlightedIdsFor", () => {
  const cheap = sampleCar({ id: "cheap", price: 20000, rating: 4 });
  const pricey = sampleCar({ id: "pricey", price: 40000, rating: 4.8 });
  const tied = sampleCar({ id: "tied", price: 20000, rating: 4.2 });

  it("marks the lowest price, the highest rating, and every car that ties", () => {
    expect(highlightedIdsFor([cheap, pricey], "price", "lowest")).toEqual(["cheap"]);
    expect(highlightedIdsFor([cheap, pricey], "rating", "highest")).toEqual(["pricey"]);
    expect(highlightedIdsFor([cheap, tied], "price", "lowest")).toEqual(["cheap", "tied"]);
    expect(highlightedIdsFor([cheap], "price", "lowest")).toEqual([]);
    expect(highlightedIdsFor([cheap, pricey], "brand", null)).toEqual([]);
    expect(getHighlightedCarIds([], "price", "lowest")).toEqual([]);
  });
});

describe("formatComparisonValue", () => {
  it("uses the readable type, fuel, and drivetrain labels", () => {
    const car = sampleCar();

    expect(formatComparisonValue(car, "type")).toBe("SUV");
    expect(formatComparisonValue(car, "fuelType")).toBe("Electric");
    expect(formatComparisonValue(car, "drivetrain")).toBe("AWD");
    expect(formatComparisonValue(car, "price")).toBe("$30,000");
    expect(formatComparisonValue(car, "weightKg")).toBe("1,500 kg");
    expect(formatComparisonValue(car, "rating")).toBe("4.0");
    expect(formatComparisonValue(car, "horsepower")).toBe("200 hp");
    expect(formatComparisonValue(car, "year")).toBe("2024");
    expect(formatComparisonValue(car, "seats")).toBe("5");
    expect(formatComparisonValue(car, "brand")).toBe("Honda");
    expect(formatComparisonValue(car, "model")).toBe("Civic");
    expect(formatComparisonValue(car, "transmission")).toBe("Automatic");
  });

  it("names removed cars and sorts the add-car options", () => {
    const first = sampleCar({ id: "b", brand: "BMW", model: "X5", year: 2024 });
    const second = sampleCar({ id: "a", brand: "Honda", model: "Civic", year: 2023 });

    expect(formatRemovedCarCount(1)).toBe(
      "1 selected car was removed because it is not in the catalog.",
    );
    expect(formatRemovedCarCount(2)).toBe(
      "2 selected cars were removed because they are not in the catalog.",
    );
    expect(comparisonTitle([])).toBe("Compare cars");
    expect(comparisonTitle([first, second])).toBe("Compare BMW X5 vs Honda Civic");
    expect(comparisonCarOptions([first, second]).map((option) => option.id)).toEqual(["a", "b"]);
  });
});
