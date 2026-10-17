import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogPage } from "../catalog-page";
import { emptyCatalogFilters } from "../model/parse-catalog-query";
import { CarFilters } from "../ui/car-filters";
import { CarList } from "../ui/car-list";
import { CarSort } from "../ui/car-sort";
import { CatalogPagination } from "../ui/catalog-pagination";

const replace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
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
      <CarFilters
        filters={{ ...emptyCatalogFilters(), brands: ["Toyota"] }}
        brands={["Honda", "Toyota"]}
        types={["sedan", "suv"]}
        bounds={bounds}
        comparisonIds={["toyota-camry"]}
      />,
    );

    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("1 applied");
    fireEvent.click(screen.getByRole("checkbox", { name: "Honda" }));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("brand=honda%2Ctoyota"), {
      scroll: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(replace).toHaveBeenCalledWith("/?compare=toyota-camry", { scroll: false });

    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "30000" } });
    fireEvent.blur(screen.getByLabelText("Minimum price"));
    expect(replace).toHaveBeenCalledWith(expect.stringContaining("minPrice=30000"), {
      scroll: false,
    });
  });

  it("opens the mobile filter panel and updates the sort", () => {
    render(
      <>
        <CarFilters
          filters={emptyCatalogFilters()}
          brands={["Toyota"]}
          types={["sedan"]}
          bounds={bounds}
          comparisonIds={[]}
        />
        <CarSort filters={emptyCatalogFilters()} bounds={bounds} comparisonIds={[]} />
      </>,
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
      <CarList cars={[]} clearFiltersHref="/" selectedIds={[]} renderAction={() => null} />,
    );

    expect(
      screen.getByRole("heading", { name: "No cars match these filters" }),
    ).toBeInTheDocument();

    rerender(
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
        selectedIds={["toyota-camry"]}
        renderAction={() => <button type="button">Add to compare</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Toyota Camry" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Toyota Camry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to compare" })).toBeInTheDocument();
  });

  it("disables the page controls at each end and hides them on a single page", () => {
    const filters = emptyCatalogFilters();
    const { rerender } = render(
      <CatalogPagination
        page={1}
        pageCount={3}
        filters={filters}
        bounds={bounds}
        comparisonIds={[]}
      />,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/?page=2");
    expect(screen.getByText("1")).toHaveAttribute("aria-current", "page");

    rerender(
      <CatalogPagination
        page={3}
        pageCount={3}
        filters={filters}
        bounds={bounds}
        comparisonIds={[]}
      />,
    );

    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/?page=2");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    rerender(
      <CatalogPagination
        page={1}
        pageCount={1}
        filters={filters}
        bounds={bounds}
        comparisonIds={[]}
      />,
    );

    expect(screen.queryByRole("navigation", { name: "Catalog pages" })).not.toBeInTheDocument();
  });

  it("renders the catalog and redirects an invalid page", () => {
    render(
      <CatalogPage
        searchParams={{}}
        selectedIds={[]}
        comparison={<p>No cars selected</p>}
        renderAction={() => <button type="button">Add to compare</button>}
      />,
    );

    expect(screen.getByText("Showing 1–12 of 32 cars")).toBeInTheDocument();
    expect(document.querySelector("script[type='application/ld+json']")).not.toBeNull();
    expect(screen.getAllByRole("button", { name: "Add to compare" })).toHaveLength(12);

    expect(() =>
      render(
        <CatalogPage
          searchParams={{ page: "99" }}
          selectedIds={["toyota-camry"]}
          comparison={null}
          renderAction={() => null}
        />,
      ),
    ).toThrow("REDIRECT /?compare=toyota-camry&page=3");
  });
});
