import { Suspense } from "react";
import type { Metadata } from "next";

import { CATALOG_PARAMS, CatalogPage, type SearchParamRecord } from "@/features/catalog";
import {
  CompareToggle,
  comparisonApi,
  ComparisonBar,
  isSelectionDisabled,
} from "@/features/comparison";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-balance text-slate-900 sm:text-4xl">
        Compare cars
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Filter the catalog, select up to 3 cars, and compare their specifications side by side.
      </p>
      <Suspense fallback={<p className="mt-6 text-slate-700">Loading cars…</p>}>
        <HomeCatalog searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function HomeCatalog({ searchParams }: { searchParams: Promise<SearchParamRecord> }) {
  const params = await searchParams;
  const selectedCars = comparisonApi.listFromCatalog(params).cars;

  const selectedIds = selectedCars.map((car) => car.id);

  return (
    <CatalogPage
      searchParams={params}
      selectedIds={selectedIds}
      comparison={<ComparisonBar cars={selectedCars} />}
      renderAction={(car) => (
        <CompareToggle
          appearance="add"
          carId={car.id}
          carName={`${car.brand} ${car.model}`}
          disabled={isSelectionDisabled(selectedIds, car.id)}
          pathname="/"
          paramName={CATALOG_PARAMS.compare}
          selected={selectedIds.includes(car.id)}
          selectedIds={selectedIds}
        />
      )}
    />
  );
}
