import { Fragment } from "react";
import Image from "next/image";

import { type Car, CAR_TYPE_LABELS, formatCarTitle, formatPrice } from "@/features/catalog";

import { buildComparisonRows } from "../model/format-comparison";
import { COMPARE_PAGE_PARAM } from "../model/selection";

import { CompareToggle } from "./compare-toggle";

type ComparisonTableProps = {
  cars: readonly Car[];
  onRemove: (carId: string) => void;
};

function ComparisonColumn({
  car,
  selectedIds,
  onRemove,
}: {
  car: Car;
  selectedIds: readonly string[];
  onRemove: (carId: string) => void;
}) {
  return (
    <th
      id={`compare-car-${car.id}`}
      scope="col"
      className="h-px border-l border-slate-200 px-2 py-3 align-top first:border-l-0 sm:px-4 sm:py-4"
    >
      <div className="flex h-full flex-col">
        <div className="relative mx-auto aspect-2/1 w-full max-w-sm overflow-hidden rounded-lg bg-slate-100">
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
          <CompareToggle
            carId={car.id}
            carName={`${car.brand} ${car.model}`}
            pathname="/compare"
            paramName={COMPARE_PAGE_PARAM}
            appearance="remove"
            selected
            selectedIds={selectedIds}
            onRemove={onRemove}
          />
        </div>
      </div>
    </th>
  );
}

export function ComparisonTable({ cars, onRemove }: ComparisonTableProps) {
  const rows = buildComparisonRows(cars);
  const selectedIds = cars.map((car) => car.id);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Specification comparison</caption>
        <thead>
          <tr>
            {cars.map((car) => (
              <ComparisonColumn
                key={car.id}
                car={car}
                selectedIds={selectedIds}
                onRemove={onRemove}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
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
                    className={`max-w-0 overflow-hidden border-l border-slate-200 px-2 py-3 align-middle text-sm first:border-l-0 sm:px-4 ${cell.isBest ? "bg-blue-50" : ""}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 truncate font-medium text-slate-900">
                        {cell.value}
                      </span>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
