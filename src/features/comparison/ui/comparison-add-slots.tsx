import { MAX_COMPARISON_CARS } from "../model/selection";

type ComparisonAddSlotsProps = {
  count: number;
  rowSpan: number;
  onAdd: () => void;
};

export function ComparisonAddSlots({ count, rowSpan, onAdd }: ComparisonAddSlotsProps) {
  return Array.from({ length: count }, (_, index) => {
    const enabled = index === 0;

    return (
      <td
        key={`add-${index}`}
        rowSpan={rowSpan}
        className="border-l border-slate-200 bg-white p-3 align-top first:border-l-0 sm:p-4"
      >
        <button
          type="button"
          disabled={!enabled}
          aria-label={`Add a vehicle in column ${MAX_COMPARISON_CARS - count + index + 1}`}
          className="min-h-11 w-full cursor-pointer rounded-md border border-blue-700 bg-white px-3 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          onClick={() => {
            if (enabled) {
              onAdd();
            }
          }}
        >
          + Add a vehicle
        </button>
      </td>
    );
  });
}
