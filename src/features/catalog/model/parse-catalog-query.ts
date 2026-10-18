import { type Car, CAR_TYPES, type CarType, isCarType } from "./car";
import { type CatalogFilters, listBrands, listCarTypes, type PriceBounds } from "./filter-cars";
import { DEFAULT_SORT_ID, isCarSortId } from "./sort-cars";

export const CATALOG_PARAMS = {
  brand: "brand",
  type: "type",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
  sort: "sort",
  page: "page",
} as const;

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parsePriceInput(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

function parseBrands(value: string | undefined, cars: readonly Car[]): string[] {
  if (!value) {
    return [];
  }

  const known = new Map(listBrands(cars).map((brand) => [brand.toLowerCase(), brand]));
  const brands: string[] = [];

  for (const part of value.split(",")) {
    const brand = known.get(part.trim().toLowerCase());

    if (brand && !brands.includes(brand)) {
      brands.push(brand);
    }
  }

  return brands;
}

function parseTypes(value: string | undefined, cars: readonly Car[]): CarType[] {
  if (!value) {
    return [];
  }

  const present = new Set(listCarTypes(cars));
  const types: CarType[] = [];

  for (const part of value.split(",")) {
    const type = part.trim().toLowerCase();

    if (isCarType(type) && present.has(type) && !types.includes(type)) {
      types.push(type);
    }
  }

  return types;
}

export function parseCatalogFilters(
  params: SearchParamRecord,
  cars: readonly Car[],
): CatalogFilters {
  let minPrice = parsePriceInput(firstParam(params[CATALOG_PARAMS.minPrice]));
  let maxPrice = parsePriceInput(firstParam(params[CATALOG_PARAMS.maxPrice]));

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    const nextMin = maxPrice;
    maxPrice = minPrice;
    minPrice = nextMin;
  }

  const sortValue = firstParam(params[CATALOG_PARAMS.sort]);
  const sort = sortValue && isCarSortId(sortValue) ? sortValue : DEFAULT_SORT_ID;

  return {
    brands: parseBrands(firstParam(params[CATALOG_PARAMS.brand]), cars),
    types: parseTypes(firstParam(params[CATALOG_PARAMS.type]), cars),
    minPrice,
    maxPrice,
    sort,
  };
}

export function emptyCatalogFilters(): CatalogFilters {
  return {
    brands: [],
    types: [],
    minPrice: null,
    maxPrice: null,
    sort: DEFAULT_SORT_ID,
  };
}

function priceFromDraft(draft: string, current: number | null): number | null {
  if (draft.trim() === "") {
    return null;
  }

  return parsePriceInput(draft) ?? current;
}

export function catalogFiltersFromDraft(
  filters: CatalogFilters,
  minPrice: string,
  maxPrice: string,
  patch: Partial<CatalogFilters> = {},
): CatalogFilters {
  return {
    brands: filters.brands,
    types: filters.types,
    minPrice: priceFromDraft(minPrice, filters.minPrice),
    maxPrice: priceFromDraft(maxPrice, filters.maxPrice),
    sort: filters.sort,
    ...patch,
  };
}

export function parseCatalogPage(params: SearchParamRecord): number {
  const value = firstParam(params[CATALOG_PARAMS.page]);

  if (!value || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  return Number(value);
}

export function catalogHref(query: string): string {
  if (query.length === 0) {
    return "/";
  }

  return `/?${query}`;
}

export function catalogQueryHref(filters: CatalogFilters, bounds: PriceBounds, page = 1): string {
  return catalogHref(serializeCatalogQuery(filters, bounds, page));
}

export function serializeCatalogQuery(
  filters: CatalogFilters,
  bounds: PriceBounds,
  page = 1,
): string {
  const params = new URLSearchParams();

  if (filters.brands.length > 0) {
    params.set(
      CATALOG_PARAMS.brand,
      [...filters.brands]
        .map((brand) => brand.toLowerCase())
        .sort((left, right) => left.localeCompare(right))
        .join(","),
    );
  }

  if (filters.types.length > 0) {
    const selected = new Set(filters.types);
    params.set(CATALOG_PARAMS.type, CAR_TYPES.filter((type) => selected.has(type)).join(","));
  }

  if (filters.minPrice !== null && filters.minPrice > bounds.min) {
    params.set(CATALOG_PARAMS.minPrice, String(filters.minPrice));
  }

  if (filters.maxPrice !== null && filters.maxPrice < bounds.max) {
    params.set(CATALOG_PARAMS.maxPrice, String(filters.maxPrice));
  }

  if (filters.sort !== DEFAULT_SORT_ID) {
    params.set(CATALOG_PARAMS.sort, filters.sort);
  }

  if (page > 1) {
    params.set(CATALOG_PARAMS.page, String(page));
  }

  return params.toString();
}
