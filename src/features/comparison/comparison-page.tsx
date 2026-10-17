import Link from "next/link";

import { formatPrice, type SearchParamRecord } from "@/features/catalog";

import { comparisonApi } from "./api/comparison-api";
import { comparisonTitle } from "./model/format-comparison";
import { MIN_COMPARISON_CARS } from "./model/selection";
import { ComparisonNavigation } from "./ui/comparison-navigation";
import { ComparisonStage } from "./ui/comparison-stage";

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
      <ComparisonNavigation>
        <ComparisonStage
          cars={page.cars}
          options={page.options}
          removedMessage={page.removedMessage}
        />
      </ComparisonNavigation>
    </>
  );
}
