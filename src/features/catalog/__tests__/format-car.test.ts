import { describe, expect, it } from "vitest";

import {
  formatAppliedFilters,
  formatCarCount,
  formatCarTitle,
  formatHorsepower,
  formatPrice,
  formatRating,
  formatWeight,
} from "../model/format-car";
import { emptyCatalogFilters } from "../model/parse-catalog-query";

describe("car formatters", () => {
  it("formats price, weight, rating, and car counts", () => {
    expect(formatPrice(28400)).toBe("$28,400");
    expect(formatWeight(1580)).toBe("1,580 kg");
    expect(formatRating(4.6)).toBe("4.6");
    expect(formatCarCount(1)).toBe("1 car");
    expect(formatCarCount(2)).toBe("2 cars");
    expect(formatHorsepower(203)).toBe("203 hp");
    expect(
      formatCarTitle({
        id: "toyota-camry",
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        type: "sedan",
        price: 28400,
        weightKg: 1500,
        rating: 4.5,
        reviewCount: 1,
        horsepower: 200,
        fuelType: "gasoline",
        transmission: "automatic",
        drivetrain: "fwd",
        seats: 5,
        imageSrc: "/cars/toyota-camry.png",
        imageAlt: "Camry",
      }),
    ).toBe("2024 Toyota Camry");
  });

  it("summarizes the filters that actually narrow the list", () => {
    const bounds = { min: 10000, max: 90000 };
    const ranged = {
      ...emptyCatalogFilters(),
      brands: ["Toyota"],
      types: ["suv" as const],
      minPrice: 20000,
      maxPrice: 40000,
    };

    expect(formatAppliedFilters(ranged, bounds)).toBe("Toyota · SUV · $20,000–$40,000");
    expect(formatAppliedFilters({ ...emptyCatalogFilters(), minPrice: 20000 }, bounds)).toBe(
      "From $20,000",
    );
    expect(formatAppliedFilters({ ...emptyCatalogFilters(), maxPrice: 40000 }, bounds)).toBe(
      "Up to $40,000",
    );
    expect(formatAppliedFilters(emptyCatalogFilters(), bounds)).toBeNull();
  });
});
