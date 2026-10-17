import { describe, expect, it } from "vitest";

import { carApi } from "../api/car-api";
import type { Car } from "../model/car";
import {
  activeFilterCount,
  filterCars,
  hasActiveFilters,
  priceBounds,
  toggleFilterValue,
} from "../model/filter-cars";
import { paginateCars } from "../model/paginate-cars";
import { emptyCatalogFilters } from "../model/parse-catalog-query";
import { sortCars } from "../model/sort-cars";

function sampleCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car",
    brand: "Honda",
    model: "Civic",
    year: 2024,
    type: "sedan",
    price: 30000,
    weightKg: 1500,
    rating: 4,
    reviewCount: 10,
    horsepower: 200,
    fuelType: "gasoline",
    transmission: "automatic",
    drivetrain: "fwd",
    seats: 5,
    imageSrc: "/cars/car.png",
    imageAlt: "Example car",
    ...overrides,
  };
}

const honda = sampleCar({
  id: "honda",
  brand: "Honda",
  model: "Civic",
  price: 25000,
  type: "sedan",
});
const toyota = sampleCar({
  id: "toyota",
  brand: "Toyota",
  model: "Camry",
  price: 32000,
  type: "suv",
  rating: 4.8,
  year: 2023,
  weightKg: 1700,
});
const ford = sampleCar({
  id: "ford",
  brand: "Ford",
  model: "Maverick",
  price: 28000,
  type: "truck",
  rating: 4.2,
  year: 2025,
  weightKg: 1600,
});
const cars = [honda, toyota, ford];

describe("filterCars", () => {
  const bounds = priceBounds(cars);

  it("returns every car when no brand or type is selected", () => {
    expect(filterCars(cars, emptyCatalogFilters(), bounds)).toEqual(cars);
  });

  it("keeps cars that match any selected brand", () => {
    const oneBrand = filterCars(cars, { ...emptyCatalogFilters(), brands: ["Honda"] }, bounds);
    const twoBrands = filterCars(
      cars,
      { ...emptyCatalogFilters(), brands: ["Honda", "Ford"] },
      bounds,
    );

    expect(oneBrand.map((car) => car.id)).toEqual(["honda"]);
    expect(twoBrands.map((car) => car.id)).toEqual(["honda", "ford"]);
  });

  it("keeps cars that match any selected type", () => {
    const filtered = filterCars(
      cars,
      { ...emptyCatalogFilters(), types: ["sedan", "truck"] },
      bounds,
    );

    expect(filtered.map((car) => car.id)).toEqual(["honda", "ford"]);
  });

  it("treats the price range as inclusive", () => {
    const filtered = filterCars(
      cars,
      { ...emptyCatalogFilters(), minPrice: 25000, maxPrice: 28000 },
      bounds,
    );

    expect(filtered.map((car) => car.id)).toEqual(["honda", "ford"]);
  });

  it("applies a minimum or a maximum on its own", () => {
    const minimum = filterCars(cars, { ...emptyCatalogFilters(), minPrice: 30000 }, bounds);
    const maximum = filterCars(cars, { ...emptyCatalogFilters(), maxPrice: 25000 }, bounds);

    expect(minimum.map((car) => car.id)).toEqual(["toyota"]);
    expect(maximum.map((car) => car.id)).toEqual(["honda"]);
  });

  it("returns nothing when the range matches no car", () => {
    const filtered = filterCars(cars, { ...emptyCatalogFilters(), minPrice: 90000 }, bounds);

    expect(filtered).toEqual([]);
  });

  it("combines brand, type, and price", () => {
    const filtered = filterCars(
      cars,
      { ...emptyCatalogFilters(), brands: ["Toyota", "Ford"], types: ["suv"], maxPrice: 32000 },
      bounds,
    );

    expect(filtered.map((car) => car.id)).toEqual(["toyota"]);
  });
});

describe("sortCars", () => {
  it("orders by the selected field and breaks ties by brand, then model", () => {
    const tied = [
      sampleCar({
        id: "z",
        brand: "Toyota",
        model: "Camry",
        rating: 4,
        price: 10,
        year: 2020,
        weightKg: 1,
      }),
      sampleCar({
        id: "a",
        brand: "Honda",
        model: "Civic",
        rating: 4,
        price: 10,
        year: 2020,
        weightKg: 1,
      }),
      sampleCar({
        id: "b",
        brand: "Honda",
        model: "Accord",
        rating: 4,
        price: 10,
        year: 2020,
        weightKg: 1,
      }),
    ];

    expect(sortCars(tied, "rating-desc").map((car) => car.id)).toEqual(["b", "a", "z"]);
    expect(sortCars(cars, "price-asc").map((car) => car.id)).toEqual(["honda", "ford", "toyota"]);
    expect(sortCars(cars, "price-desc").map((car) => car.id)).toEqual(["toyota", "ford", "honda"]);
    expect(sortCars(cars, "year-desc").map((car) => car.id)).toEqual(["ford", "honda", "toyota"]);
    expect(sortCars(cars, "weight-asc").map((car) => car.id)).toEqual(["honda", "ford", "toyota"]);
  });
});

describe("filter helpers", () => {
  const bounds = { min: 10000, max: 90000 };

  it("toggles a value on and off without duplicating it", () => {
    const added = toggleFilterValue(["honda"], "toyota", true);
    const duplicate = toggleFilterValue(added, "toyota", true);

    expect(added).toEqual(["honda", "toyota"]);
    expect(duplicate).toEqual(["honda", "toyota"]);
    expect(toggleFilterValue(added, "honda", false)).toEqual(["toyota"]);
  });

  it("counts only bounds that narrow the catalog", () => {
    const filters = {
      ...emptyCatalogFilters(),
      brands: ["Honda"],
      types: ["suv" as const],
      minPrice: 10000,
      maxPrice: 40000,
    };

    expect(activeFilterCount(filters, bounds)).toBe(3);
    expect(hasActiveFilters(filters)).toBe(true);
    expect(hasActiveFilters(emptyCatalogFilters())).toBe(false);
  });

  it("uses zero bounds when the catalog is empty", () => {
    expect(priceBounds([])).toEqual({ min: 0, max: 0 });
  });
});

describe("paginateCars", () => {
  it("splits the list into pages of 12 and clamps an out-of-range page", () => {
    const source = Array.from({ length: 13 }, (_, index) => sampleCar({ id: `car-${index}` }));
    const first = paginateCars(source, 1);
    const last = paginateCars(source, 99);

    expect(first.cars).toHaveLength(12);
    expect(first.pageCount).toBe(2);
    expect(last.page).toBe(2);
    expect(last.cars).toHaveLength(1);
    expect(paginateCars([], 0)).toMatchObject({ page: 1, pageCount: 1, total: 0, rangeStart: 0 });
  });
});

describe("cars dataset", () => {
  it("has 32 unique cars with valid ratings, prices, and photos", () => {
    const cars = carApi.listCars();
    const ids = cars.map((car) => car.id);

    expect(new Set(ids).size).toBe(32);
    expect(priceBounds(cars)).toEqual({ min: 22500, max: 79990 });
    expect(
      cars.every(
        (car) =>
          car.rating >= 0 &&
          car.rating <= 5 &&
          car.price > 0 &&
          car.weightKg > 0 &&
          car.imageSrc === `/cars/${car.id}.png`,
      ),
    ).toBe(true);
  });
});
