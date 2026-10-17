import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ComparePage, { generateMetadata } from "../compare/page";
import RootLayout from "../layout";
import NotFound from "../not-found";
import HomePage from "../page";
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

    const metadata = await generateMetadata({
      params: Promise.resolve({}),
      searchParams: Promise.resolve({ ids: "toyota-camry,honda-accord" }),
    });

    expect(metadata.title).toBe("Compare Toyota Camry vs Honda Accord");
    expect(robots().sitemap).toBe("http://localhost:3000/sitemap.xml");
    expect(sitemap()).toEqual([
      { url: "http://localhost:3000", changeFrequency: "monthly", priority: 1 },
    ]);
  });
});
