import type { Car, CarType } from "../model/car";
import { buildCarCatalogJsonLd } from "../model/catalog-json-ld";
import {
  type CatalogFilters,
  filterCars,
  hasActiveFilters,
  listBrands,
  listCarTypes,
  type PriceBounds,
  priceBounds,
} from "../model/filter-cars";
import { catalogResultLabel, formatAppliedFilters } from "../model/format-car";
import { paginateCars } from "../model/paginate-cars";
import {
  CATALOG_PARAMS,
  catalogHref,
  emptyCatalogFilters,
  firstParam,
  parseCatalogFilters,
  parseCatalogPage,
  type SearchParamRecord,
  serializeCatalogQuery,
} from "../model/parse-catalog-query";
import { DEFAULT_SORT_ID, sortCars } from "../model/sort-cars";

import { carApi } from "./car-api";

export type CatalogScreen = {
  redirectHref: string | null;
  filters: CatalogFilters;
  bounds: PriceBounds;
  brands: readonly string[];
  types: readonly CarType[];
  cars: readonly Car[];
  page: number;
  pageCount: number;
  resultLabel: string;
  summary: string | null;
  clearHref: string;
  filtersActive: boolean;
  indexable: boolean;
  canonicalPath: string;
  jsonLd: string | null;
};

function catalogHomeHref(bounds: PriceBounds): string {
  return catalogHref(serializeCatalogQuery(emptyCatalogFilters(), bounds));
}

export type CatalogApi = {
  loadPage(params: SearchParamRecord): CatalogScreen;
  catalogHomeHref(): string;
};

export const catalogApi: CatalogApi = {
  loadPage(params) {
    const all = carApi.listCars();
    const filters = parseCatalogFilters(params, all);
    const bounds = priceBounds(all);
    const result = paginateCars(
      sortCars(filterCars(all, filters, bounds), filters.sort),
      parseCatalogPage(params),
    );
    const requestedPage = firstParam(params[CATALOG_PARAMS.page]);
    const canonicalPage = result.page > 1 ? String(result.page) : undefined;
    const filtersActive = hasActiveFilters(filters);
    const canonicalPath = catalogHref(serializeCatalogQuery(filters, bounds, result.page));

    return {
      redirectHref:
        requestedPage === canonicalPage
          ? null
          : catalogHref(serializeCatalogQuery(filters, bounds, result.page)),
      filters,
      bounds,
      brands: listBrands(all),
      types: listCarTypes(all),
      cars: result.cars,
      page: result.page,
      pageCount: result.pageCount,
      resultLabel: catalogResultLabel(
        result.pageCount,
        result.rangeStart,
        result.rangeEnd,
        result.total,
      ),
      summary: formatAppliedFilters(filters, bounds),
      clearHref: catalogHomeHref(bounds),
      filtersActive,
      indexable: !filtersActive && filters.sort === DEFAULT_SORT_ID,
      canonicalPath,
      jsonLd: result.cars.length === 0 ? null : JSON.stringify(buildCarCatalogJsonLd(result.cars)),
    };
  },

  catalogHomeHref() {
    return catalogHomeHref(priceBounds(carApi.listCars()));
  },
};
