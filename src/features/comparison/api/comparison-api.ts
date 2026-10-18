import { carApi } from "@/features/catalog/api/car-api";
import { catalogApi } from "@/features/catalog/api/catalog-api";
import type { Car } from "@/features/catalog/model/car";
import { firstParam, type SearchParamRecord } from "@/features/catalog/model/parse-catalog-query";

import { comparisonCarOptions, comparisonTitle } from "../model/format-comparison";
import { parseCompareIds } from "../model/parse-compare-ids";
import { COMPARE_PAGE_PARAM, compareHref, MAX_COMPARISON_CARS } from "../model/selection";

export type ComparisonResult = {
  cars: Car[];
  unknownIds: string[];
};

function resolveIds(ids: readonly string[]): ComparisonResult {
  const cars: Car[] = [];
  const unknownIds: string[] = [];

  for (const id of ids) {
    const car = carApi.getCar(id);

    if (car) {
      cars.push(car);
    } else {
      unknownIds.push(id);
    }
  }

  return { cars, unknownIds };
}

export type ComparisonScreen = ComparisonResult & {
  title: string;
  redirectHref: string | null;
  backHref: string;
  options: { id: string; label: string }[];
};

export type ComparisonApi = {
  listFromPage(params: SearchParamRecord): ComparisonResult;
  loadPage(params: SearchParamRecord): ComparisonScreen;
};

export const comparisonApi: ComparisonApi = {
  listFromPage(params) {
    const ids = parseCompareIds(firstParam(params[COMPARE_PAGE_PARAM]), MAX_COMPARISON_CARS);

    return resolveIds(ids);
  },

  loadPage(params) {
    const comparison = this.listFromPage(params);
    const orderedIds =
      comparison.cars.length === 0 ? undefined : comparison.cars.map((car) => car.id).join(",");
    const requestedIds = firstParam(params[COMPARE_PAGE_PARAM]);

    return {
      ...comparison,
      title: comparisonTitle(comparison.cars),
      redirectHref:
        requestedIds === orderedIds ? null : compareHref(comparison.cars.map((car) => car.id)),
      backHref: catalogApi.catalogHomeHref(),
      options: comparisonCarOptions(carApi.listCars()),
    };
  },
};
