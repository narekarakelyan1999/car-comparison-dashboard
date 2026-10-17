"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { CATALOG_PARAMS } from "@/features/catalog";

import type { COMPARE_PAGE_PARAM } from "../model/selection";
import { nextSelectionHref } from "../model/selection";

type CompareParamName = typeof CATALOG_PARAMS.compare | typeof COMPARE_PAGE_PARAM;
type CompareAppearance = "add" | "remove" | "chip";

type CompareToggleProps = {
  carId: string;
  carName: string;
  selected: boolean;
  disabled: boolean;
  pathname: "/" | "/compare";
  paramName: CompareParamName;
  appearance: CompareAppearance;
  selectedIds: readonly string[];
};

const appearanceClassName: Record<CompareAppearance, string> = {
  add: "flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 hover:border-slate-400 hover:bg-slate-100 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-700 has-[:checked]:text-white has-[:checked]:hover:border-blue-800 has-[:checked]:hover:bg-blue-800 has-[:disabled]:opacity-50",
  chip: "inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-3 text-sm text-slate-900 hover:bg-slate-200",
  remove:
    "inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline hover:text-blue-800",
};

const pressClassName =
  "cursor-pointer transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 has-[:disabled]:cursor-not-allowed has-[:disabled]:active:scale-100";

function toggleLabel(appearance: CompareAppearance, selected: boolean, carName: string): string {
  if (appearance === "remove") {
    return "Remove";
  }

  if (appearance === "chip") {
    return carName;
  }

  if (selected) {
    return "Added";
  }

  return "Add to compare";
}

function accessibleName(appearance: CompareAppearance, selected: boolean, carName: string): string {
  if (appearance === "remove" || appearance === "chip") {
    return `Remove ${carName}`;
  }

  if (selected) {
    return `Added ${carName}`;
  }

  return `Add ${carName} to compare`;
}

function ChipMark({ appearance }: { appearance: CompareAppearance }) {
  if (appearance !== "chip") {
    return null;
  }

  return <span aria-hidden="true">×</span>;
}

export function CompareToggle({
  carId,
  carName,
  selected,
  disabled,
  pathname,
  paramName,
  appearance,
  selectedIds,
}: CompareToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange() {
    const href = nextSelectionHref(
      pathname,
      paramName,
      searchParams.toString(),
      carId,
      selectedIds,
    );

    if (!href) {
      return;
    }

    router.replace(href, { scroll: false });
  }

  return (
    <label className={`${appearanceClassName[appearance]} ${pressClassName}`}>
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        disabled={disabled}
        aria-label={accessibleName(appearance, selected, carName)}
        onChange={onChange}
      />
      <span>{toggleLabel(appearance, selected, carName)}</span>
      <ChipMark appearance={appearance} />
    </label>
  );
}
