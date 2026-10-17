import { createElement } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Car } from "@/features/catalog";

import { ComparisonTable } from "../ui/comparison-table";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => createElement("img", { alt, src }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => undefined }),
  useSearchParams: () => new URLSearchParams(),
}));

function sampleCar(overrides: Partial<Car>): Car {
  return {
    id: "car",
    brand: "Honda",
    model: "Civic",
    year: 2024,
    type: "sedan",
    price: 30000,
    weightKg: 1500,
    rating: 4,
    reviewCount: 10,
    horsepower: 200,
    fuelType: "gasoline",
    transmission: "automatic",
    drivetrain: "fwd",
    seats: 5,
    imageSrc: "/cars/car.png",
    imageAlt: "Example car",
    ...overrides,
  };
}

describe("ComparisonTable", () => {
  it("shows both prices and marks the cheaper car as the lowest price", () => {
    render(
      <ComparisonTable
        cars={[
          sampleCar({
            id: "cheap",
            brand: "Toyota",
            model: "Corolla",
            price: 20000,
            imageAlt: "Toyota Corolla",
          }),
          sampleCar({
            id: "pricey",
            brand: "BMW",
            model: "X5",
            price: 40000,
            imageAlt: "BMW X5",
          }),
        ]}
      />,
    );

    expect(screen.getByRole("table", { name: "Specification comparison" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Price" })).toBeInTheDocument();

    const cheap = screen
      .getAllByText("$20,000")
      .map((node) => node.closest("td"))
      .find((cell) => cell !== null);
    const pricey = screen
      .getAllByText("$40,000")
      .map((node) => node.closest("td"))
      .find((cell) => cell !== null);

    expect(cheap).toHaveTextContent("Best");
    expect(cheap).toHaveTextContent("Lowest price");
    expect(pricey).not.toHaveTextContent("Best");
    expect(screen.getByRole("img", { name: "Toyota Corolla" })).toBeInTheDocument();
  });
});
