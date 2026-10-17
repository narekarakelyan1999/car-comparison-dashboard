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
import { sortCars } from "../model/sort-cars";

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
  jsonLd: string | null;
};

function catalogHomeHref(selectedIds: readonly string[], bounds: PriceBounds): string {
  return catalogHref(serializeCatalogQuery(emptyCatalogFilters(), selectedIds, bounds));
}

export type CatalogApi = {
  loadPage(params: SearchParamRecord, selectedIds: readonly string[]): CatalogScreen;
  catalogHomeHref(selectedIds: readonly string[]): string;
};

export const catalogApi: CatalogApi = {
  loadPage(params, selectedIds) {
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

    return {
      redirectHref:
        requestedPage === canonicalPage
          ? null
          : catalogHref(serializeCatalogQuery(filters, selectedIds, bounds, result.page)),
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
      clearHref: catalogHomeHref(selectedIds, bounds),
      filtersActive,
      jsonLd:
        filtersActive || result.page !== 1 ? null : JSON.stringify(buildCarCatalogJsonLd(all)),
    };
  },

  catalogHomeHref(selectedIds) {
    return catalogHomeHref(selectedIds, priceBounds(carApi.listCars()));
  },
};
