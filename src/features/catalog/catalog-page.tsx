import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { catalogApi } from "./api/catalog-api";
import type { Car } from "./model/car";
import type { SearchParamRecord } from "./model/parse-catalog-query";
import { CarFilters, CarList, CarSort, CatalogPagination } from "./ui";

type CatalogPageProps = {
  searchParams: SearchParamRecord;
  selectedIds: readonly string[];
  renderAction: (car: Car) => ReactNode;
  comparison: ReactNode;
};

export function CatalogPage({
  searchParams,
  selectedIds,
  renderAction,
  comparison,
}: CatalogPageProps) {
  const catalog = catalogApi.loadPage(searchParams, selectedIds);

  if (catalog.redirectHref) {
    redirect(catalog.redirectHref);
  }

  return (
    <>
      <div className={selectedIds.length > 0 ? "pb-44 sm:pb-36" : undefined}>
        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
          <CarFilters
            filters={catalog.filters}
            brands={catalog.brands}
            types={catalog.types}
            bounds={catalog.bounds}
            comparisonIds={selectedIds}
          />
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-slate-700" aria-live="polite">
                  {catalog.resultLabel}
                </p>
                {catalog.summary ? (
                  <p className="mt-1 text-sm text-slate-600">{catalog.summary}</p>
                ) : null}
              </div>
              <CarSort
                filters={catalog.filters}
                bounds={catalog.bounds}
                comparisonIds={selectedIds}
              />
            </div>
            {catalog.filtersActive ? (
              <p className="mt-3">
                <Link
                  href={catalog.clearHref}
                  className="inline-flex min-h-11 items-center text-sm text-blue-700 underline"
                >
                  Clear filters
                </Link>
              </p>
            ) : null}
            <div className="mt-4">
              <CarList
                cars={catalog.cars}
                clearFiltersHref={catalog.clearHref}
                selectedIds={selectedIds}
                renderAction={renderAction}
              />
            </div>
            <CatalogPagination
              page={catalog.page}
              pageCount={catalog.pageCount}
              filters={catalog.filters}
              bounds={catalog.bounds}
              comparisonIds={selectedIds}
            />
          </div>
        </div>
      </div>
      {comparison}
      {catalog.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: catalog.jsonLd }} />
      ) : null}
    </>
  );
}
