import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ComparisonSelectionProvider } from "@/features/comparison";

import { CatalogPage } from "../catalog-page";
import type { Car } from "../model/car";
import { emptyCatalogFilters } from "../model/parse-catalog-query";
import { CatalogNavigation } from "../provider/catalog-navigation";
import { AddToCompare } from "../ui/add-to-compare";
import { CarFilters } from "../ui/car-filters";
import { CarList } from "../ui/car-list";
import { CarSort } from "../ui/car-sort";
import { CatalogPagination } from "../ui/catalog-pagination";
import { ComparisonBar } from "../ui/comparison-bar";

const replace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  redirect: (href: string) => {
    throw new Error(`REDIRECT ${href}`);
  },
}));

const bounds = { min: 20000, max: 80000 };

describe("catalog screens", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("filters, sorts, and clears through the catalog URL", () => {
    render(
      <CatalogNavigation
        filters={{ ...emptyCatalogFilters(), brands: ["Toyota"] }}
        bounds={bounds}
        page={1}
      >
        <CarFilters brands={["Honda", "Toyota"]} types={["sedan", "suv"]} />
      </CatalogNavigation>,
    );

    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("1 applied");
    fireEvent.click(screen.getByRole("checkbox", { name: "Honda" }));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("brand=honda%2Ctoyota"), {
      scroll: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(replace).toHaveBeenCalledWith("/", { scroll: false });

    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "30000" } });
    fireEvent.blur(screen.getByLabelText("Minimum price"));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("minPrice=30000"), {
      scroll: false,
    });
  });

  it("keeps a committed price when the next draft is not a whole number", () => {
    render(
      <CatalogNavigation
        filters={{ ...emptyCatalogFilters(), minPrice: 30000 }}
        bounds={bounds}
        page={1}
      >
        <CarFilters brands={["Toyota"]} types={["sedan"]} />
      </CatalogNavigation>,
    );

    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "30000.5" } });
    fireEvent.blur(screen.getByLabelText("Minimum price"));

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Minimum price")).toHaveValue(30000);
  });

  it("leaves the catalog in place when clear or price blur does not change the URL", () => {
    render(
      <CatalogNavigation filters={emptyCatalogFilters()} bounds={bounds} page={2}>
        <CarFilters brands={["Toyota"]} types={["sedan"]} />
      </CatalogNavigation>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    fireEvent.blur(screen.getByLabelText("Minimum price"));
    fireEvent.blur(screen.getByLabelText("Maximum price"));
    fireEvent.submit(screen.getByRole("form", { name: "Filter cars" }));

    expect(replace).not.toHaveBeenCalled();
  });

  it("opens the mobile filter panel and updates the sort", () => {
    render(
      <CatalogNavigation filters={emptyCatalogFilters()} bounds={bounds} page={1}>
        <CarFilters brands={["Toyota"]} types={["sedan"]} />
        <CarSort />
      </CatalogNavigation>,
    );

    const toggle = screen.getByRole("button", { name: /Filters/ });

    expect(toggle).toHaveTextContent("Show");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Hide");

    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "price-asc" } });
    expect(replace).toHaveBeenCalledWith("/?sort=price-asc", { scroll: false });
    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "not-a-sort" } });
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("shows an empty catalog and a filled page of results", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider>
        <CarList cars={[]} clearFiltersHref="/" />
      </ComparisonSelectionProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "No cars match these filters" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/");

    rerender(
      <ComparisonSelectionProvider>
        <CarList
          cars={[
            {
              id: "toyota-camry",
              brand: "Toyota",
              model: "Camry",
              year: 2024,
              type: "sedan",
              price: 28400,
              weightKg: 1580,
              rating: 4.6,
              reviewCount: 12,
              horsepower: 203,
              fuelType: "gasoline",
              transmission: "automatic",
              drivetrain: "fwd",
              seats: 5,
              imageSrc: "/cars/toyota-camry.png",
              imageAlt: "Toyota Camry",
            },
          ]}
          clearFiltersHref="/"
        />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("heading", { name: "Toyota Camry" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Toyota Camry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Toyota Camry to compare" })).toBeInTheDocument();
  });

  it("disables the page controls at each end and hides them on a single page", () => {
    const filters = emptyCatalogFilters();
    const { rerender } = render(
      <CatalogNavigation filters={filters} bounds={bounds} page={1}>
        <CatalogPagination pageCount={3} />
      </CatalogNavigation>,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/?page=2");
    expect(screen.getByText("1")).toHaveAttribute("aria-current", "page");

    rerender(
      <CatalogNavigation filters={filters} bounds={bounds} page={3}>
        <CatalogPagination pageCount={3} />
      </CatalogNavigation>,
    );

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/?page=2");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    rerender(
      <CatalogNavigation filters={filters} bounds={bounds} page={1}>
        <CatalogPagination pageCount={1} />
      </CatalogNavigation>,
    );

    expect(screen.queryByRole("navigation", { name: "Catalog pages" })).not.toBeInTheDocument();
  });

  it("renders the catalog and redirects an invalid page", () => {
    render(
      <ComparisonSelectionProvider>
        <CatalogPage searchParams={{}} />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByText("Showing 1–12 of 32 cars")).toBeInTheDocument();
    expect(document.querySelector("script[type='application/ld+json']")).not.toBeNull();
    expect(screen.getAllByRole("button", { name: /Add .+ to compare/ })).toHaveLength(12);

    expect(() => render(<CatalogPage searchParams={{ page: "99" }} />)).toThrow(
      "REDIRECT /?page=3",
    );
  });

  it("adds a catalog car and does nothing when the selection is already full", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider initialIds={["toyota-camry"]}>
        <AddToCompare carId="honda-accord" carName="Honda Accord" />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("button", { name: "Add Honda Accord to compare" })).toHaveClass(
      "focus-visible:outline-2",
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Honda Accord to compare" }));
    expect(screen.getByRole("button", { name: "Added Honda Accord" })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();

    rerender(
      <ComparisonSelectionProvider key="full" initialIds={["a", "b", "c"]}>
        <AddToCompare carId="ford-mustang" carName="Ford Mustang" />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("button", { name: "Add Ford Mustang to compare" })).toBeDisabled();
  });

  it("hides the bar until a car is selected and requires two cars to compare", () => {
    const camry = sampleCar({ id: "toyota-camry", brand: "Toyota", model: "Camry" });
    const accord = sampleCar({ id: "honda-accord", brand: "Honda", model: "Accord" });
    const mustang = sampleCar({ id: "ford-mustang", brand: "Ford", model: "Mustang" });
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
    fireEvent.click(screen.getByRole("link", { name: "Compare" }));
    expect(
      screen.getByRole("region", { name: "Selected cars for comparison" }),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();

    rerender(
      <ComparisonSelectionProvider key="three" initialIds={[camry.id, accord.id, mustang.id]}>
        <ComparisonBar cars={catalog} />
      </ComparisonSelectionProvider>,
    );
    expect(screen.getByText("You can compare up to 3 cars.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove Toyota Camry" }));
    expect(screen.queryByRole("button", { name: "Remove Toyota Camry" })).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

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
