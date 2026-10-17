import { ButtonLink } from "@/shared/ui";

import { type Car, CATALOG_PARAMS, formatCarCount } from "@/features/catalog";

import { compareHref, MAX_COMPARISON_CARS, MIN_COMPARISON_CARS } from "../model/selection";

import { CompareToggle } from "./compare-toggle";

type ComparisonBarProps = {
  cars: readonly Car[];
};

function CompareAction({ cars }: { cars: readonly Car[] }) {
  if (cars.length >= MIN_COMPARISON_CARS) {
    return (
      <ButtonLink
        href={compareHref(cars.map((car) => car.id))}
        variant="primary"
        className="w-full sm:w-auto"
      >
        Compare
      </ButtonLink>
    );
  }

  return <p className="text-sm text-slate-700">Select at least 2 cars</p>;
}

function LimitNotice({ count }: { count: number }) {
  if (count < MAX_COMPARISON_CARS) {
    return null;
  }

  return (
    <p className="text-sm text-slate-700">You can compare up to {MAX_COMPARISON_CARS} cars.</p>
  );
}

export function ComparisonBar({ cars }: ComparisonBarProps) {
  if (cars.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Selected cars for comparison"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm motion-reduce:transition-none"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-900">{formatCarCount(cars.length)} selected</p>
          <CompareAction cars={cars} />
        </div>
        <ul className="flex list-none flex-wrap gap-2">
          {cars.map((car) => (
            <li key={car.id}>
              <CompareToggle
                carId={car.id}
                carName={`${car.brand} ${car.model}`}
                selected
                disabled={false}
                pathname="/"
                paramName={CATALOG_PARAMS.compare}
                appearance="chip"
                selectedIds={cars.map((item) => item.id)}
              />
            </li>
          ))}
        </ul>
        <LimitNotice count={cars.length} />
      </div>
    </section>
  );
}
