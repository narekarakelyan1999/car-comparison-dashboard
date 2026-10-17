import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
}));

import { catalogApi } from "@/features/catalog";

import { siteConfig } from "@/config/site";

import { generateMetadata as compareMetadata } from "../compare/page";
import { metadata as siteMetadata } from "../layout";
import NotFound from "../not-found";
import { generateMetadata as homeMetadata } from "../page";
import robots from "../robots";
import { SiteHeader } from "../site-header";
import sitemap from "../sitemap";

describe("app routes", () => {
  it("renders the site header", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Car Comparison" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("href", "/");
  });

  it("renders the not-found page", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to catalog" })).toHaveAttribute("href", "/");
  });

  it("publishes home and compare metadata, robots, and the sitemap", async () => {
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

    expect(siteMetadata.description).toBe(siteConfig.description);
    expect(siteMetadata.description?.length).toBeGreaterThanOrEqual(120);
    expect(siteMetadata.description?.length).toBeLessThanOrEqual(160);
    expect(siteMetadata.authors).toEqual([{ name: siteConfig.name, url: siteConfig.url }]);
    expect(siteMetadata.creator).toBe(siteConfig.name);
    expect(siteMetadata.publisher).toBe(siteConfig.name);
    expect(siteMetadata.category).toBe(siteConfig.category);
    expect(siteMetadata.keywords).toEqual([...siteConfig.keywords]);
    expect(home.alternates).toEqual({ canonical: "/" });
    expect(home.robots).toEqual({ index: true, follow: true });
    expect(filtered.robots).toEqual({ index: false, follow: true });
    expect(filtered.alternates).toEqual({ canonical: "/?brand=bmw&sort=price-asc" });
  });
});
