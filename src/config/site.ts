export const siteConfig = {
  name: "Car Comparison",
  title: "Car Comparison Dashboard",
  description: "Compare car prices, brands, weight, ratings, and specifications side by side.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
