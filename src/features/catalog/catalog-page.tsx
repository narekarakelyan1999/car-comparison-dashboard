import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { catalogApi } from "./api/catalog-api";
import type { Car } from "./model/car";
import type { SearchParamRecord } from "./model/parse-catalog-query";
import { CatalogClearLink, CatalogNavigation, CatalogPending } from "./ui/catalog-navigation";
import { CarFilters, CarList, CarSort, CatalogPagination } from "./ui";

type CatalogPageProps = {
  searchParams: SearchParamRecord;
  renderAction: (car: Car) => ReactNode;
  comparison: ReactNode;
};

export function CatalogPage({ searchParams, renderAction, comparison }: CatalogPageProps) {
  const catalog = catalogApi.loadPage(searchParams);

  if (catalog.redirectHref) {
    redirect(catalog.redirectHref);
  }

  return (
    <>
      <CatalogNavigation filters={catalog.filters} bounds={catalog.bounds} page={catalog.page}>
        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
          <CarFilters brands={catalog.brands} types={catalog.types} />
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
              <CarSort />
            </div>
            {catalog.filtersActive ? (
              <p className="mt-3">
                <CatalogClearLink
                  href={catalog.clearHref}
                  className="inline-flex min-h-11 items-center text-sm text-blue-700 underline"
                >
                  Clear filters
                </CatalogClearLink>
              </p>
            ) : null}
            <div className="mt-4">
              <CatalogPending>
                <CarList
                  cars={catalog.cars}
                  clearFiltersHref={catalog.clearHref}
                  renderAction={renderAction}
                />
              </CatalogPending>
            </div>
            <CatalogPagination pageCount={catalog.pageCount} />
          </div>
        </div>
      </CatalogNavigation>
      {comparison}
      {catalog.jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: catalog.jsonLd }} />
      ) : null}
    </>
  );
}
