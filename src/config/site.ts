function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, "");

  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, "")}`;
  }

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Car Comparison",
  title: "Car Comparison Dashboard",
  description:
    "Browse cars by price, brand, model, weight, and rating. Filter by brand, type, and price, then compare up to three cars and their specifications side by side.",
  category: "Automotive",
  keywords: [
    "car comparison",
    "car prices",
    "car ratings",
    "car weight",
    "car specifications",
    "car brands",
  ],
  url: siteOrigin(),
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).href;
}
