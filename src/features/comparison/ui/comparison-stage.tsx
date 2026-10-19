"use client";

import { useEffect, useOptimistic, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Car } from "@/features/catalog";

import { comparisonTitle } from "../model/format-comparison";
import { COMPARE_PAGE_PARAM, replaceSelectionQuery } from "../model/selection";
import { ComparisonPending, useComparisonNavigation } from "../provider/comparison-navigation";
import { useComparisonSelection } from "../provider/comparison-selection";

import { ComparisonAddDialog } from "./comparison-add-dialog";
import { ComparisonTable } from "./comparison-table";

type ComparisonStageProps = {
  cars: readonly Car[];
  options: readonly { id: string; label: string }[];
};

export function ComparisonStage({ cars, options }: ComparisonStageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clear } = useComparisonSelection();
  const { startNavigation } = useComparisonNavigation();
  const [addOpen, setAddOpen] = useState(false);
  const [optimisticCars, dropCar] = useOptimistic(cars, (current: readonly Car[], carId: string) =>
    current.filter((car) => car.id !== carId),
  );

  useEffect(() => {
    clear();
  }, [clear]);

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
      router.replace(href, { scroll: false });
    });
  }

  return (
    <>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {comparisonTitle(optimisticCars)}
      </h1>
      <div className="mt-6 min-w-0">
        <ComparisonPending>
          <ComparisonTable
            cars={optimisticCars}
            onRemove={removeCar}
            onAdd={() => setAddOpen(true)}
          />
        </ComparisonPending>
      </div>
      <ComparisonAddDialog
        open={addOpen}
        cars={optimisticCars}
        options={options}
        onClose={() => setAddOpen(false)}
      />
    </>
  );
}
