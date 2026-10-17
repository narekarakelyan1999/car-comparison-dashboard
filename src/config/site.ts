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
  description: "Compare car prices, brands, weight, ratings, and specifications side by side.",
  url: siteOrigin(),
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).href;
}
