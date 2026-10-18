import { Fragment } from "react";
import Image from "next/image";

import { type Car, CAR_TYPE_LABELS, formatCarTitle, formatPrice } from "@/features/catalog";

import { buildComparisonRows } from "../model/format-comparison";
import { MAX_COMPARISON_CARS } from "../model/selection";

type ComparisonTableProps = {
  cars: readonly Car[];
  onRemove: (carId: string) => void;
  onAdd: () => void;
};

function ComparisonColumn({ car, onRemove }: { car: Car; onRemove: (carId: string) => void }) {
  return (
    <th
      id={`compare-car-${car.id}`}
      scope="col"
      className="h-px border-l border-slate-200 px-2 py-3 align-top first:border-l-0 sm:px-4 sm:py-4"
    >
      <div className="flex h-full flex-col">
        <div className="relative aspect-2/1 w-full min-w-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={car.imageSrc}
            alt={car.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-contain p-2"
          />
        </div>
        <span className="mt-2 block text-xs font-medium tracking-wide text-slate-600 uppercase">
          {CAR_TYPE_LABELS[car.type]}
        </span>
        <span className="mt-1 block text-sm font-semibold text-balance text-slate-900 sm:text-base">
          {formatCarTitle(car)}
        </span>
        <span className="mt-1 block text-base font-semibold text-slate-900 sm:text-lg">
          {formatPrice(car.price)}
        </span>
        <div className="mt-auto">
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-blue-700 underline hover:text-blue-800"
            aria-label={`Remove ${car.brand} ${car.model}`}
            onClick={() => onRemove(car.id)}
          >
            Remove
          </button>
        </div>
      </div>
    </th>
  );
}

function ComparisonAddSlots({
  count,
  rowSpan,
  onAdd,
}: {
  count: number;
  rowSpan: number;
  onAdd: () => void;
}) {
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

export function ComparisonTable({ cars, onRemove, onAdd }: ComparisonTableProps) {
  const rows = buildComparisonRows(cars);
  const emptyCount = MAX_COMPARISON_CARS - cars.length;
  const showSpecs = cars.length > 0;
  const rowSpan = showSpecs ? rows.length * 2 + 1 : 1;

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <div className="w-[max(100%,48rem)] [transform:translateZ(0)]">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">Specification comparison</caption>
          <tbody>
            <tr className={showSpecs ? undefined : "h-64"}>
              {cars.map((car) => (
                <ComparisonColumn key={car.id} car={car} onRemove={onRemove} />
              ))}
              <ComparisonAddSlots count={emptyCount} rowSpan={rowSpan} onAdd={onAdd} />
            </tr>
            {showSpecs
              ? rows.map((row) => (
                  <Fragment key={row.key}>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <th
                        id={`compare-row-${row.key}`}
                        colSpan={cars.length}
                        scope="colgroup"
                        className="px-2 py-2 text-left text-xs font-medium tracking-wide text-slate-600 uppercase sm:px-4"
                      >
                        {row.label}
                      </th>
                    </tr>
                    <tr>
                      {row.cells.map((cell) => (
                        <td
                          key={cell.carId}
                          headers={`compare-row-${row.key} compare-car-${cell.carId}`}
                          className={`border-l border-slate-200 px-2 py-3 align-middle text-sm first:border-l-0 sm:px-4 ${cell.isBest ? "bg-blue-50" : ""}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{cell.value}</span>
                            {cell.isBest && row.phrase ? (
                              <>
                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                  Best
                                </span>
                                <span className="sr-only"> {row.phrase}</span>
                              </>
                            ) : null}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </Fragment>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
