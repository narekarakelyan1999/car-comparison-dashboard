import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { catalogApi } from "@/features/catalog";

import { siteConfig } from "@/config/site";

import ComparePage, { generateMetadata as compareMetadata } from "../compare/page";
import RootLayout from "../layout";
import NotFound from "../not-found";
import HomePage, { generateMetadata as homeMetadata } from "../page";
import robots from "../robots";
import { SiteHeader } from "../site-header";
import sitemap from "../sitemap";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-sans" }),
  Geist_Mono: () => ({ variable: "--font-mono" }),
}));

describe("app routes", () => {
  it("renders the header, layout, and home page", () => {
    render(
      <RootLayout params={Promise.resolve({})}>
        <SiteHeader />
        <p>Content</p>
      </RootLayout>,
    );

    expect(screen.getAllByRole("link", { name: "Car Comparison" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Catalog" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Content")).toBeInTheDocument();

    render(<HomePage params={Promise.resolve({})} searchParams={Promise.resolve({})} />);
    expect(screen.getByRole("heading", { name: "Compare cars" })).toBeInTheDocument();
    expect(screen.getByText("Loading cars…")).toBeInTheDocument();
  });

  it("renders the not-found page", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to catalog" })).toHaveAttribute("href", "/");
  });

  it("renders the compare route shell and publishes robots and sitemap data", async () => {
    render(
      <ComparePage
        params={Promise.resolve({})}
        searchParams={Promise.resolve({ ids: "toyota-camry,honda-accord" })}
      />,
    );
    expect(screen.getByText("Loading comparison…")).toBeInTheDocument();

    const metadata = await compareMetadata({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ ids: "toyota-camry,honda-accord" }),
    });

    expect(metadata.title).toBe("Compare Toyota Camry vs Honda Accord");
    expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml");

    const pageCount = catalogApi.loadPage({}).pageCount;

    expect(sitemap()).toEqual(
      Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;

        return {
          url: page === 1 ? siteConfig.url : `${siteConfig.url}/?page=${page}`,
          changeFrequency: "monthly",
          priority: page === 1 ? 1 : 0.6,
        };
      }),
    );

    const home = await homeMetadata({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({}),
    });
    const filtered = await homeMetadata({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ brand: "bmw", sort: "price-asc" }),
    });

    expect(home.alternates).toEqual({ canonical: "/" });
    expect(home.robots).toEqual({ index: true, follow: true });
    expect(filtered.robots).toEqual({ index: false, follow: true });
    expect(filtered.alternates).toEqual({ canonical: "/?brand=bmw&sort=price-asc" });
  });
});
