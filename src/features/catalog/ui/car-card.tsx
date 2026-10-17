"use client";

import type { ReactNode } from "react";
import Image from "next/image";

import { useComparisonSelection } from "@/features/comparison/ui/comparison-selection";

import { type Car, CAR_TYPE_LABELS } from "../model/car";
import { formatPrice, formatRating, formatWeight } from "../model/format-car";

type CarCardProps = {
  car: Car;
  priority?: boolean;
  children?: ReactNode;
};

function cardClassName(selected: boolean): string {
  const border = selected ? "border-blue-700 ring-2 ring-blue-700" : "border-slate-200";

  return `flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm ${border}`;
}

export function CarCard({ car, priority = false, children }: CarCardProps) {
  const selected = useComparisonSelection().ids.includes(car.id);
  const imageProps = priority ? { priority: true as const } : { loading: "lazy" as const };

  return (
    <article className={cardClassName(selected)}>
      <div className="relative aspect-video bg-slate-100">
        <Image
          src={car.imageSrc}
          alt={car.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3"
          {...imageProps}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-slate-600 uppercase">
            {CAR_TYPE_LABELS[car.type]}
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            {car.brand} {car.model}
          </h2>
          <p className="text-sm text-slate-600">{car.year}</p>
        </div>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">
          {formatPrice(car.price)}
        </p>
        <p className="text-sm text-slate-700">
          {formatRating(car.rating)} out of 5<span className="text-slate-400"> · </span>
          {car.reviewCount} reviews
          <span className="text-slate-400"> · </span>
          {formatWeight(car.weightKg)}
        </p>
        <div className="mt-auto pt-1">{children}</div>
      </div>
    </article>
  );
}
