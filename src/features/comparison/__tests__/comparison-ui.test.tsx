import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Car } from "@/features/catalog";
import { ComparisonBar } from "@/features/catalog/ui/comparison-bar";

import { absoluteUrl, siteConfig } from "@/config/site";

import { comparisonMetadata, ComparisonPage } from "../comparison-page";
import { ComparisonSelectionProvider } from "../provider/comparison-selection";

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

describe("comparison screens", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("clears the catalog selection when the comparison page opens", () => {
    render(
      <ComparisonSelectionProvider initialIds={[camry.id, accord.id]}>
        <ComparisonBar cars={[camry, accord]} />
        <ComparisonPage searchParams={{ ids: "honda-accord,toyota-camry" }} />
      </ComparisonSelectionProvider>,
    );

    expect(
      screen.queryByRole("region", { name: "Selected cars for comparison" }),
    ).not.toBeInTheDocument();
  });

  it("adds a car from the next column and keeps later columns disabled", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{ ids: "toyota-camry" }} />
      </ComparisonSelectionProvider>,
    );

    const addButtons = screen.getAllByRole("button", { name: /Add a vehicle in column/ });
    expect(addButtons).toHaveLength(2);
    expect(addButtons[0]).toBeEnabled();
    expect(addButtons[1]).toBeDisabled();
    expect(screen.getByRole("table", { name: "Specification comparison" })).toBeInTheDocument();
    expect(screen.getByText("2024 Toyota Camry")).toBeInTheDocument();

    fireEvent.click(addButtons[1]);
    expect(screen.queryByRole("dialog", { name: "Add a vehicle" })).not.toBeInTheDocument();

    fireEvent.click(addButtons[0]);
    expect(screen.getByRole("dialog", { name: "Add a vehicle" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add vehicle" }));
    expect(replace).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Car"), { target: { value: "honda-accord" } });
    fireEvent.click(screen.getByRole("button", { name: "Add vehicle" }));
    expect(replace).toHaveBeenCalledWith("/compare?ids=toyota-camry%2Chonda-accord", {
      scroll: false,
    });

    rerender(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{ ids: "ford-mustang,honda-accord,toyota-camry" }} />
      </ComparisonSelectionProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /Add a vehicle in column/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("2024 Ford Mustang")).toBeInTheDocument();
  });

  it("shows an empty comparison, a removed id, and a real pair", () => {
    const { rerender } = render(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{}} />
      </ComparisonSelectionProvider>,
    );

    expect(screen.getByRole("heading", { name: "Compare cars" })).toBeInTheDocument();
    const emptySlots = screen.getAllByRole("button", { name: /Add a vehicle in column/ });
    expect(emptySlots).toHaveLength(3);
    expect(emptySlots[0]).toBeEnabled();
    expect(emptySlots[1]).toBeDisabled();
    expect(emptySlots[2]).toBeDisabled();
    expect(screen.getByRole("table", { name: "Specification comparison" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Browse cars" })).not.toBeInTheDocument();

    expect(() =>
      render(
        <ComparisonSelectionProvider>
          <ComparisonPage searchParams={{ ids: "nope,toyota-camry" }} />
        </ComparisonSelectionProvider>,
      ),
    ).toThrow("REDIRECT /compare?ids=toyota-camry");

    rerender(
      <ComparisonSelectionProvider>
        <ComparisonPage searchParams={{ ids: "honda-accord,toyota-camry" }} />
      </ComparisonSelectionProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Compare Honda Accord vs Toyota Camry" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Add a vehicle in column/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Remove Toyota Camry" }));
    expect(replace).toHaveBeenCalledWith("/compare?ids=honda-accord", { scroll: false });
  });

  it("asks search engines to skip a comparison of fewer than two cars", () => {
    const canonicalPath = "/compare?ids=honda-accord,toyota-camry";

    expect(comparisonMetadata({ ids: "toyota-camry" })).toMatchObject({
      title: "Compare cars",
      robots: { index: false, follow: true },
      alternates: { canonical: "/compare?ids=toyota-camry" },
      openGraph: {
        title: `Compare cars | ${siteConfig.name}`,
        url: absoluteUrl("/compare?ids=toyota-camry"),
      },
    });
    expect(comparisonMetadata({ ids: "toyota-camry,honda-accord" })).toMatchObject({
      title: "Compare Toyota Camry vs Honda Accord",
      robots: { index: true, follow: true },
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `Compare Toyota Camry vs Honda Accord | ${siteConfig.name}`,
        description: "Toyota Camry ($28,400), Honda Accord ($29,100)",
        url: absoluteUrl(canonicalPath),
      },
    });
    expect(comparisonMetadata({ ids: "honda-accord,toyota-camry" })).toMatchObject({
      title: "Compare Honda Accord vs Toyota Camry",
      robots: { index: true, follow: true },
      alternates: { canonical: canonicalPath },
      openGraph: {
        title: `Compare Honda Accord vs Toyota Camry | ${siteConfig.name}`,
        description: "Honda Accord ($29,100), Toyota Camry ($28,400)",
        url: absoluteUrl(canonicalPath),
        images: [{ url: "/opengraph-image" }],
      },
      twitter: {
        card: "summary_large_image",
        title: `Compare Honda Accord vs Toyota Camry | ${siteConfig.name}`,
      },
    });
  });
});
