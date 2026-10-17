import Link from "next/link";

import { EmptyState } from "@/shared/ui";

import { formatPrice, type SearchParamRecord } from "@/features/catalog";

import { comparisonApi } from "./api/comparison-api";
import { comparisonTitle } from "./model/format-comparison";
import { MIN_COMPARISON_CARS } from "./model/selection";
import { ComparisonAddCar, ComparisonTable } from "./ui";

type ComparisonPageProps = {
  searchParams: SearchParamRecord;
};

export function comparisonMetadata(searchParams: SearchParamRecord) {
  const { cars } = comparisonApi.listFromPage(searchParams);

  if (cars.length < MIN_COMPARISON_CARS) {
    return {
      title: "Compare cars",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: comparisonTitle(cars),
    description: cars
      .map((car) => `${car.brand} ${car.model} (${formatPrice(car.price)})`)
      .join(", "),
  };
}

export function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const page = comparisonApi.loadPage(searchParams);

  return (
    <>
      <p>
        <Link
          href={page.backHref}
          className="inline-flex min-h-11 items-center text-sm font-medium text-blue-700"
        >
          ← Back to catalog
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl">
        {page.title}
      </h1>
      {page.removedMessage ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
        >
          {page.removedMessage}
        </p>
      ) : null}
      {page.cars.length > 0 ? (
        <div className="mt-6">
          <ComparisonAddCar cars={page.options} selectedIds={page.cars.map((car) => car.id)} />
        </div>
      ) : null}
      <div className="mt-4">
        {page.cars.length === 0 ? (
          <EmptyState
            title="Select at least two cars"
            description="Choose 2 or 3 cars from the catalog to see them side by side."
            action={{ href: "/", label: "Browse cars" }}
          />
        ) : (
          <ComparisonTable cars={page.cars} />
        )}
      </div>
    </>
  );
}
