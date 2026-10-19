"use client";

import { type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, Dialog, Select } from "@/shared/ui";

import type { Car } from "@/features/catalog";

import { COMPARE_PAGE_PARAM, nextSelectionHref } from "../model/selection";
import { useComparisonNavigation } from "../provider/comparison-navigation";

type ComparisonCarOption = {
  id: string;
  label: string;
};

type ComparisonAddDialogProps = {
  open: boolean;
  cars: readonly Car[];
  options: readonly ComparisonCarOption[];
  onClose: () => void;
};

export function ComparisonAddDialog({ open, cars, options, onClose }: ComparisonAddDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startNavigation } = useComparisonNavigation();
  const [carId, setCarId] = useState("");

  const selectedIds = cars.map((car) => car.id);
  const selected = new Set(selectedIds);
  const available = options.filter((option) => !selected.has(option.id));

  function close() {
    setCarId("");
    onClose();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    startNavigation(() => {
      router.replace(href, { scroll: false });
    });

    close();
  }

  return (
    <Dialog title="Add a vehicle" open={open} onClose={close}>
      <form onSubmit={onSubmit}>
        <Select
          id="add-vehicle-car"
          label="Car"
          value={carId}
          onChange={(event) => setCarId(event.target.value)}
        >
          <option value="">Choose a car</option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="mt-5 flex justify-end">
          <Button type="submit" variant="primary" disabled={carId.length === 0}>
            Add vehicle
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
