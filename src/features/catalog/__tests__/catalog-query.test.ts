import { describe, expect, it } from "vitest";

import { absoluteUrl } from "@/config/site";

import { catalogApi } from "../api/catalog-api";
import type { Car } from "../model/car";
import { formatCarTitle } from "../model/format-car";
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
      bounds,
    );

    expect(query).toBe("brand=honda%2Ctoyota&type=sedan%2Csuv&maxPrice=40000&sort=price-asc");
    expect(serializeCatalogQuery(emptyCatalogFilters(), bounds)).toBe("");
  });
});

describe("catalogApi.loadPage", () => {
  it("redirects an out-of-range page and ignores an unknown brand without redirecting", () => {
    const tooFar = catalogApi.loadPage({ page: "99" });
    const unknownBrand = catalogApi.loadPage({ brand: "Nope" });

    expect(tooFar.redirectHref).toBe("/?page=3");
    expect(tooFar.page).toBe(3);
    expect(unknownBrand.redirectHref).toBeNull();
    expect(unknownBrand.cars).toHaveLength(12);
    expect(catalogApi.catalogHomeHref()).toBe("/");

    const firstPage = catalogApi.loadPage({});
    const structured = JSON.parse(firstPage.jsonLd ?? "") as {
      itemListElement: {
        position: number;
        item: { name: string; image: string; offers: { price: string } };
      }[];
    };
    const firstCar = firstPage.cars[0];

    expect(firstCar).toBeDefined();
    expect(structured.itemListElement[0]?.position).toBe(1);
    expect(structured.itemListElement[0]?.item.name).toBe(firstCar ? formatCarTitle(firstCar) : "");
    expect(structured.itemListElement[0]?.item.image).toBe(absoluteUrl(firstCar?.imageSrc ?? ""));
    expect(structured.itemListElement[0]?.item.offers.price).toBe(String(firstCar?.price));
    expect(structured.itemListElement).toHaveLength(firstPage.cars.length);

    const secondPage = catalogApi.loadPage({ page: "2" });
    const secondStructured = JSON.parse(secondPage.jsonLd ?? "") as {
      itemListElement: { item: { name: string } }[];
    };

    const secondCar = secondPage.cars[0];

    expect(secondPage.canonicalPath).toBe("/?page=2");
    expect(secondPage.indexable).toBe(true);
    expect(secondStructured.itemListElement[0]?.item.name).toBe(
      secondCar ? formatCarTitle(secondCar) : "",
    );
    expect(secondStructured.itemListElement[0]?.item.name).not.toBe(
      structured.itemListElement[0]?.item.name,
    );

    const filtered = catalogApi.loadPage({ brand: "bmw", sort: "price-asc" });

    expect(filtered.indexable).toBe(false);
    expect(filtered.canonicalPath).toContain("brand=bmw");
    expect(JSON.parse(filtered.jsonLd ?? "")).toMatchObject({
      itemListElement: filtered.cars.map((car) => ({
        item: { name: formatCarTitle(car), offers: { price: String(car.price) } },
      })),
    });
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
    expect(catalogQueryHref(filters, bounds, 2)).toBe("/?brand=toyota&minPrice=25000&page=2");
  });
});
