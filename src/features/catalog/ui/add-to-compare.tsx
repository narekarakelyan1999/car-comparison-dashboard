"use client";

import { isSelectionDisabled } from "@/features/comparison/model/selection";
import { useComparisonSelection } from "@/features/comparison/provider/comparison-selection";

type AddToCompareProps = {
  carId: string;
  carName: string;
};

const pressClassName =
  "cursor-pointer transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

export function AddToCompare({ carId, carName }: AddToCompareProps) {
  const selection = useComparisonSelection();
  const selected = selection.ids.includes(carId);
  const disabled = isSelectionDisabled(selection.ids, carId);
  const selectedClassName = selected
    ? "border-blue-700 bg-blue-700 text-white hover:border-blue-800 hover:bg-blue-800"
    : "border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-100";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={selected ? `Added ${carName}` : `Add ${carName} to compare`}
      className={`flex min-h-11 w-full items-center justify-center rounded-md border px-4 text-sm font-medium ${selectedClassName} ${pressClassName}`}
      onClick={() => selection.toggle(carId)}
    >
      {selected ? "Added" : "Add to compare"}
    </button>
  );
}
