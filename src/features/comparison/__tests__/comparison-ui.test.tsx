import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Car } from "@/features/catalog";

import { comparisonMetadata, ComparisonPage } from "../comparison-page";
import { CompareToggle } from "../ui/compare-toggle";
import { ComparisonAddCar } from "../ui/comparison-add-car";
import { ComparisonBar } from "../ui/comparison-bar";
import { ComparisonNavigation } from "../ui/comparison-navigation";
import { ComparisonSelectionProvider } from "../ui/comparison-selection";

const replace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
  redirect: (href: string) => {
    throw new Error(`REDIRECT ${href}`);
  },
}));

function sampleCar(overrides: Partial<Car>): Car {
  return {
    id: "car",
    brand: "Toyota",
    model: "Camry",
    year: 2024,
    type: "sedan",
    price: 28400,
    weightKg: 1580,
    rating: 4.6,
    reviewCount: 10,
    horsepower: 203,
    fuelType: "gasoline",
    transmission: "automatic",
    drivetrain: "fwd",
    seats: 5,
    imageSrc: "/cars/car.png",
    imageAlt: "Example",
    ...overrides,
  };
}

const camry = sampleCar({ id: "toyota-camry", brand: "Toyota", model: "Camry" });
const accord = sampleCar({ id: "honda-accord", brand: "Honda", model: "Accord" });
const mustang = sampleCar({ id: "ford-mustang", brand: "Ford", model: "Mustang" });

describe("comparison screens", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("hides the bar until a car is selected and requires two cars to compare", () => {
    const catalog = [camry, accord, mustang];
    const { rerender } = render(
      <ComparisonSelectionProvider key="empty" initialIds={[]}>
        <ComparisonBar cars={catalog} />
      </ComparisonSelectionProvider>,
    );

    expect(
      screen.queryByRole("region", { name: "Selected cars for comparison" }),
    ).not.toBeInTheDocument();

    rerender(
      <ComparisonSelectionProvider key="one" initialIds={[camry.id]}>
        <ComparisonBar cars={catalog} />
      </ComparisonSelectionProvider>,
    );
    expect(screen.getByText("1 car selected")).toBeInTheDocument();
    expect(screen.getByText("Select at least 2 cars")).toBeInTheDocument();

    rerender(
      <ComparisonSelectionProvider key="two" initialIds={[camry.id, accord.id]}>
        <ComparisonBar cars={catalog} />
      </ComparisonSelectionProvider>,
    );
    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute(
      "href",
      "/compare?ids=toyota-camry,honda-accord",
    );

    rerender(
      <ComparisonSelectionProvider key="three" initialIds={[camry.id, accord.id, mustang.id]}>
        <ComparisonBar cars={catalog} />
      </ComparisonSelectionProvider>,
    );
    expect(screen.getByText("You can compare up to 3 cars.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Remove Toyota Camry" }));
    expect(screen.queryByRole("checkbox", { name: "Remove Toyota Camry" })).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("adds a car from the comparison page and ignores a full selection", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider>
        <ComparisonNavigation>
          <ComparisonAddCar
            cars={[
              { id: "honda-accord", label: "2024 Honda Accord" },
              { id: "toyota-camry", label: "2024 Toyota Camry" },
            ]}
            selectedIds={["toyota-camry"]}
          />
        </ComparisonNavigation>
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByText("1 of 3 cars selected.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Add a car"), { target: { value: "" } });
    expect(replace).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Add a car"), { target: { value: "honda-accord" } });
    expect(replace).toHaveBeenCalledWith("/compare?ids=toyota-camry%2Chonda-accord", {
      scroll: false,
    });

    rerender(
      <ComparisonSelectionProvider>
        <ComparisonNavigation>
          <ComparisonAddCar
            cars={[{ id: "honda-accord", label: "2024 Honda Accord" }]}
            selectedIds={["a", "b", "c"]}
          />
        </ComparisonNavigation>
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByLabelText("Add a car")).toBeDisabled();
    expect(screen.getByText("Comparison is full")).toBeInTheDocument();
  });

  it("adds a catalog car and does nothing when the selection is already full", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider initialIds={["toyota-camry"]}>
        <CompareToggle
          appearance="add"
          carId="honda-accord"
          carName="Honda Accord"
          pathname="/"
          paramName="compare"
        />
      </ComparisonSelectionProvider>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Add Honda Accord to compare" }));
    expect(screen.getByRole("checkbox", { name: "Added Honda Accord" })).toBeChecked();
    expect(replace).not.toHaveBeenCalled();

    rerender(
      <ComparisonSelectionProvider key="full" initialIds={["a", "b", "c"]}>
        <CompareToggle
          appearance="add"
          carId="ford-mustang"
          carName="Ford Mustang"
          pathname="/"
          paramName="compare"
        />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("checkbox", { name: "Add Ford Mustang to compare" })).toBeDisabled();
  });

  it("shows an empty comparison, a removed id, and a real pair", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{}} />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("heading", { name: "Compare cars" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Select at least two cars" })).toBeInTheDocument();

    rerender(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{ ids: "nope,toyota-camry" }} />
      </ComparisonSelectionProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 selected car was removed because it is not in the catalog.",
    );
    expect(screen.getByRole("heading", { name: "Compare cars" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Select at least two cars" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    rerender(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{ ids: "toyota-camry,honda-accord" }} />
      </ComparisonSelectionProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Compare Toyota Camry vs Honda Accord" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Add a car")).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("asks search engines to skip a comparison of fewer than two cars", () => {
    expect(comparisonMetadata({ ids: "toyota-camry" })).toMatchObject({
      title: "Compare cars",
      robots: { index: false, follow: true },
    });
    expect(comparisonMetadata({ ids: "toyota-camry,honda-accord" }).title).toBe(
      "Compare Toyota Camry vs Honda Accord",
    );
  });
});
