"use client";

import { useComparisonSelection } from "@/features/comparison/provider/comparison-selection";

type SelectedCarChipProps = {
  carId: string;
  carName: string;
};

export function SelectedCarChip({ carId, carName }: SelectedCarChipProps) {
  const { toggle } = useComparisonSelection();

  return (
    <button
      type="button"
      aria-label={`Remove ${carName}`}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 text-sm text-slate-900 transition-[background-color,transform] duration-150 ease-out hover:bg-slate-200 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      onClick={() => toggle(carId)}
    >
      <span>{carName}</span>
      <span aria-hidden="true">×</span>
    </button>
  );
}
