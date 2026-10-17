"use client";

import { type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/shared/ui";

import {
  COMPARE_PAGE_PARAM,
  MAX_COMPARISON_CARS,
  nextSelectionHref,
  toggleComparisonId,
} from "../model/selection";

import { useComparisonNavigation } from "./comparison-navigation";
import { useComparisonSelection } from "./comparison-selection";

type ComparisonCarOption = {
  id: string;
  label: string;
};

type ComparisonAddCarProps = {
  cars: readonly ComparisonCarOption[];
  selectedIds: readonly string[];
};

function addCarPlaceholder(atLimit: boolean): string {
  if (atLimit) {
    return "Comparison is full";
  }

  return "Choose a car";
}

function selectionStatus(atLimit: boolean, count: number): string {
  if (atLimit) {
    return `You can compare up to ${MAX_COMPARISON_CARS} cars.`;
  }

  return `${count} of ${MAX_COMPARISON_CARS} cars selected.`;
}

export function ComparisonAddCar({ cars, selectedIds }: ComparisonAddCarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selection = useComparisonSelection();
  const { startNavigation } = useComparisonNavigation();
  const atLimit = selectedIds.length >= MAX_COMPARISON_CARS;
  const selected = new Set(selectedIds);
  const available = cars.filter((car) => !selected.has(car.id));

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const carId = event.target.value;

    if (!carId) {
      return;
    }

    const href = nextSelectionHref(
      "/compare",
      COMPARE_PAGE_PARAM,
      searchParams.toString(),
      carId,
      selectedIds,
    );

    if (!href) {
      return;
    }

    const nextIds = toggleComparisonId(selectedIds, carId);

    startNavigation(() => {
      selection.replace(nextIds);
      router.replace(href, { scroll: false });
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Select
          id="add-comparison-car"
          label="Add a car"
          className="min-w-0 w-full flex-1"
          selectClassName="block w-full sm:ml-4 sm:inline-block sm:w-auto sm:max-w-sm"
          value=""
          disabled={atLimit || available.length === 0}
          describedBy={atLimit ? "comparison-limit" : undefined}
          onChange={onChange}
        >
          <option value="">{addCarPlaceholder(atLimit)}</option>
          {available.map((car) => (
            <option key={car.id} value={car.id}>
              {car.label}
            </option>
          ))}
        </Select>
        <p
          id={atLimit ? "comparison-limit" : undefined}
          className="text-sm text-slate-700 sm:max-w-xs sm:text-right"
        >
          {selectionStatus(atLimit, selectedIds.length)}
        </p>
      </div>
    </div>
  );
}
