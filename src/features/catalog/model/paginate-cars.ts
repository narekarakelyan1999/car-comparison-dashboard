import type { Car } from "./car";

export const CARS_PER_PAGE = 12;

export type CatalogPageResult = {
  cars: Car[];
  page: number;
  pageCount: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
};

export function paginateCars(source: readonly Car[], page: number): CatalogPageResult {
  const total = source.length;
  const pageCount = Math.max(1, Math.ceil(total / CARS_PER_PAGE));
  const currentPage = Number.isInteger(page) && page > 0 ? Math.min(page, pageCount) : 1;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * CARS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * CARS_PER_PAGE, total);
  const startIndex = rangeStart === 0 ? 0 : rangeStart - 1;

  return {
    cars: source.slice(startIndex, rangeEnd),
    page: currentPage,
    pageCount,
    total,
    rangeStart,
    rangeEnd,
  };
}
