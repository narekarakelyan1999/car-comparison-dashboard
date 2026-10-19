import { EmptyState } from "@/shared/ui";

import type { Car } from "../model/car";

import { CarCard } from "./car-card";

const PRIORITY_CARD_COUNT = 3;

type CarListProps = {
  cars: readonly Car[];
  clearFiltersHref: string;
};

export function CarList({ cars, clearFiltersHref }: CarListProps) {
  if (cars.length === 0) {
    return (
      <EmptyState
        title="No cars match these filters"
        description="Clear the filters to see the full catalog."
        action={{ href: clearFiltersHref, label: "Clear filters", replace: true }}
      />
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {cars.map((car, index) => (
        <li key={car.id}>
          <CarCard car={car} priority={index < PRIORITY_CARD_COUNT} />
        </li>
      ))}
    </ul>
  );
}
