import Link from "next/link";
import { redirect } from "next/navigation";

import { formatPrice, type SearchParamRecord } from "@/features/catalog";

import { siteConfig, socialMetadata } from "@/config/site";

import { comparisonApi } from "./api/comparison-api";
import { comparisonTitle } from "./model/format-comparison";
import { comparisonCanonicalPath, MIN_COMPARISON_CARS } from "./model/selection";
import { ComparisonNavigation } from "./provider/comparison-navigation";
import { ComparisonStage } from "./ui/comparison-stage";

type ComparisonPageProps = {
  searchParams: SearchParamRecord;
};

export function comparisonMetadata(searchParams: SearchParamRecord) {
  const page = comparisonApi.loadPage(searchParams);
  const { cars } = page;
  const canonicalPath = comparisonCanonicalPath(cars.map((car) => car.id));
  const comparable = cars.length >= MIN_COMPARISON_CARS;

  return socialMetadata({
    title: comparable ? comparisonTitle(cars) : "Compare cars",
    description: comparable
      ? cars.map((car) => `${car.brand} ${car.model} (${formatPrice(car.price)})`).join(", ")
      : siteConfig.description,
    canonicalPath,
    index: page.redirectHref === null && comparable,
  });
}

export function ComparisonPage({ searchParams }: ComparisonPageProps) {
  const page = comparisonApi.loadPage(searchParams);

  if (page.redirectHref) {
    redirect(page.redirectHref);
  }

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
      <ComparisonNavigation>
        <ComparisonStage cars={page.cars} options={page.options} />
      </ComparisonNavigation>
    </>
  );
}
