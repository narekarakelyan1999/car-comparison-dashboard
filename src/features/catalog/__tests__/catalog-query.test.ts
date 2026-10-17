import { describe, expect, it } from "vitest";

import { catalogApi } from "../api/catalog-api";
import type { Car } from "../model/car";
import {
  catalogFiltersFromDraft,
  catalogQueryHref,
  emptyCatalogFilters,
  parseCatalogFilters,
  parseCatalogPage,
  serializeCatalogQuery,
} from "../model/parse-catalog-query";

function sampleCar(overrides: Partial<Car> = {}): Car {
  return {
    id: "car",
    brand: "Toyota",
    model: "Camry",
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

const cars = [
  sampleCar({ id: "toyota", brand: "Toyota", type: "sedan" }),
  sampleCar({ id: "honda", brand: "Honda", type: "suv" }),
];

describe("parseCatalogFilters", () => {
  it("reads a valid query", () => {
    const filters = parseCatalogFilters(
      {
        brand: "honda,toyota",
        type: "suv",
        minPrice: "20000",
        maxPrice: "40000",
        sort: "price-asc",
      },
      cars,
    );

    expect(filters).toEqual({
      brands: ["Honda", "Toyota"],
      types: ["suv"],
      minPrice: 20000,
      maxPrice: 40000,
      sort: "price-asc",
    });
  });

  it("drops unknown brands, types, prices, and sort values", () => {
    const filters = parseCatalogFilters(
      { brand: "nope,toyota", type: "boat,suv", minPrice: "12.5", maxPrice: "abc", sort: "nope" },
      cars,
    );

    expect(filters.brands).toEqual(["Toyota"]);
    expect(filters.types).toEqual(["suv"]);
    expect(filters.minPrice).toBeNull();
    expect(filters.maxPrice).toBeNull();
    expect(filters.sort).toBe("rating-desc");
  });

  it("swaps a minimum that is higher than the maximum", () => {
    const filters = parseCatalogFilters({ minPrice: "50000", maxPrice: "20000" }, cars);

    expect(filters.minPrice).toBe(20000);
    expect(filters.maxPrice).toBe(50000);
  });

  it("uses the first value when a parameter is repeated", () => {
    const filters = parseCatalogFilters(
      { brand: ["Toyota", "Honda"], sort: ["price-asc", "year-desc"] },
      cars,
    );

    expect(filters.brands).toEqual(["Toyota"]);
    expect(filters.sort).toBe("price-asc");
  });
});

describe("parseCatalogPage", () => {
  it("treats a missing or invalid page as page 1", () => {
    expect(parseCatalogPage({})).toBe(1);
    expect(parseCatalogPage({ page: "abc" })).toBe(1);
    expect(parseCatalogPage({ page: "0" })).toBe(1);
    expect(parseCatalogPage({ page: "2" })).toBe(2);
  });
});

describe("serializeCatalogQuery", () => {
  it("omits the default sort, empty filters, and prices that sit on the bounds", () => {
    const bounds = { min: 10000, max: 90000 };
    const query = serializeCatalogQuery(
      {
        ...emptyCatalogFilters(),
        brands: ["Toyota", "Honda"],
        types: ["suv", "sedan"],
        minPrice: 10000,
        maxPrice: 40000,
        sort: "price-asc",
      },
      ["toyota", "honda"],
      bounds,
    );

    expect(query).toBe(
      "brand=honda%2Ctoyota&type=sedan%2Csuv&maxPrice=40000&sort=price-asc&compare=toyota%2Chonda",
    );
    expect(serializeCatalogQuery(emptyCatalogFilters(), [], bounds)).toBe("");
  });
});

describe("catalogApi.loadPage", () => {
  it("redirects an out-of-range page and ignores an unknown brand without redirecting", () => {
    const tooFar = catalogApi.loadPage({ page: "99" }, []);
    const unknownBrand = catalogApi.loadPage({ brand: "Nope" }, []);

    expect(tooFar.redirectHref).toBe("/?page=3");
    expect(tooFar.page).toBe(3);
    expect(unknownBrand.redirectHref).toBeNull();
    expect(unknownBrand.cars).toHaveLength(12);
    expect(catalogApi.catalogHomeHref(["toyota-camry"])).toBe("/?compare=toyota-camry");
  });
});

describe("catalog query links", () => {
  it("builds the next filter link from the price draft", () => {
    const bounds = { min: 10000, max: 90000 };
    const filters = catalogFiltersFromDraft(emptyCatalogFilters(), "25000", "nope", {
      brands: ["Toyota"],
    });

    expect(filters.minPrice).toBe(25000);
    expect(filters.maxPrice).toBeNull();
    expect(catalogQueryHref(filters, [], bounds, 2)).toBe("/?brand=toyota&minPrice=25000&page=2");
  });
});
