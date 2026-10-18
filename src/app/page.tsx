import { Suspense } from "react";
import type { Metadata } from "next";

import { carApi, catalogApi, CatalogPage, type SearchParamRecord } from "@/features/catalog";
import { CompareToggle, ComparisonBar } from "@/features/comparison";

import { siteConfig, socialMetadata } from "@/config/site";

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const page = catalogApi.loadPage(await searchParams);

  return socialMetadata({
    description: siteConfig.description,
    canonicalPath: page.canonicalPath,
    index: page.indexable,
  });
}

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

  return (
    <CatalogPage
      searchParams={params}
      comparison={<ComparisonBar cars={carApi.listCars()} />}
      renderAction={(car) => (
        <CompareToggle appearance="add" carId={car.id} carName={`${car.brand} ${car.model}`} />
      )}
    />
  );
}
