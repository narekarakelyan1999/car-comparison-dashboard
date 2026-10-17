import {
  type Car,
  carApi,
  catalogApi,
  firstParam,
  type SearchParamRecord,
} from "@/features/catalog";

import {
  comparisonCarOptions,
  comparisonTitle,
  formatRemovedCarCount,
} from "../model/format-comparison";
import { parseCompareIds } from "../model/parse-compare-ids";
import { COMPARE_PAGE_PARAM, MAX_COMPARISON_CARS } from "../model/selection";

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
  removedMessage: string | null;
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

    return {
      ...comparison,
      title: comparisonTitle(comparison.cars),
      removedMessage:
        comparison.unknownIds.length === 0
          ? null
          : formatRemovedCarCount(comparison.unknownIds.length),
      backHref: catalogApi.catalogHomeHref(),
      options: comparisonCarOptions(carApi.listCars()),
    };
  },
};
