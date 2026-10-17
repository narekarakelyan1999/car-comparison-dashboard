"use client";

import { useOptimistic } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/shared/ui";

import type { Car } from "@/features/catalog";

import { comparisonTitle } from "../model/format-comparison";
import { COMPARE_PAGE_PARAM, MIN_COMPARISON_CARS, replaceSelectionQuery } from "../model/selection";

import { ComparisonAddCar } from "./comparison-add-car";
import { ComparisonPending, useComparisonNavigation } from "./comparison-navigation";
import { useComparisonSelection } from "./comparison-selection";
import { ComparisonTable } from "./comparison-table";

type ComparisonStageProps = {
  cars: readonly Car[];
  options: readonly { id: string; label: string }[];
  removedMessage: string | null;
};

export function ComparisonStage({ cars, options, removedMessage }: ComparisonStageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selection = useComparisonSelection();
  const { startNavigation } = useComparisonNavigation();
  const [optimisticCars, dropCar] = useOptimistic(cars, (current: readonly Car[], carId: string) =>
    current.filter((car) => car.id !== carId),
  );

  function removeCar(carId: string) {
    const nextCars = optimisticCars.filter((car) => car.id !== carId);

    if (nextCars.length === optimisticCars.length) {
      return;
    }

    const nextIds = nextCars.map((car) => car.id);
    const href = replaceSelectionQuery(
      "/compare",
      COMPARE_PAGE_PARAM,
      searchParams.toString(),
      nextIds,
    );

    startNavigation(() => {
      dropCar(carId);
      selection.replace(nextIds);
      router.replace(href, { scroll: false });
    });
  }

  const belowMinimum = optimisticCars.length < MIN_COMPARISON_CARS;

  return (
    <>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl">
        {comparisonTitle(optimisticCars)}
      </h1>
      {removedMessage ? (
        <p
          role="status"
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
        >
          {removedMessage}
        </p>
      ) : null}
      {optimisticCars.length > 0 ? (
        <div className="mt-6">
          <ComparisonAddCar cars={options} selectedIds={optimisticCars.map((car) => car.id)} />
        </div>
      ) : null}
      <div className="mt-4">
        {belowMinimum ? (
          <EmptyState
            title="Select at least two cars"
            description="Choose 2 or 3 cars from the catalog to see them side by side."
            action={{ href: "/", label: "Browse cars" }}
          />
        ) : (
          <ComparisonPending>
            <ComparisonTable cars={optimisticCars} onRemove={removeCar} />
          </ComparisonPending>
        )}
      </div>
    </>
  );
}
