"use client";

import { isSelectionDisabled } from "../model/selection";

import { useComparisonSelection } from "./comparison-selection";

type CompareAppearance = "add" | "chip";

type CompareToggleProps = {
  carId: string;
  carName: string;
  appearance: CompareAppearance;
};

const appearanceClassName: Record<CompareAppearance, string> = {
  add: "flex min-h-11 w-full items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-900 hover:border-slate-400 hover:bg-slate-100 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-700 has-[:checked]:text-white has-[:checked]:hover:border-blue-800 has-[:checked]:hover:bg-blue-800 has-[:disabled]:opacity-50",
  chip: "inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-100 px-3 text-sm text-slate-900 hover:bg-slate-200",
};

const pressClassName =
  "cursor-pointer transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 has-[:disabled]:cursor-not-allowed has-[:disabled]:active:scale-100";

function toggleLabel(appearance: CompareAppearance, selected: boolean, carName: string): string {
  if (appearance === "chip") {
    return carName;
  }

  if (selected) {
    return "Added";
  }

  return "Add to compare";
}

function accessibleName(appearance: CompareAppearance, selected: boolean, carName: string): string {
  if (appearance === "chip") {
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

export function CompareToggle({ carId, carName, appearance }: CompareToggleProps) {
  const selection = useComparisonSelection();
  const checked = selection.ids.includes(carId);
  const controlDisabled = isSelectionDisabled(selection.ids, carId);

  return (
    <label className={`${appearanceClassName[appearance]} ${pressClassName}`}>
      <input
        type="checkbox"
        className="sr-only pointer-events-none"
        checked={checked}
        disabled={controlDisabled}
        aria-label={accessibleName(appearance, checked, carName)}
        onChange={() => selection.toggle(carId)}
      />
      <span>{toggleLabel(appearance, checked, carName)}</span>
      <ChipMark appearance={appearance} />
    </label>
  );
}
