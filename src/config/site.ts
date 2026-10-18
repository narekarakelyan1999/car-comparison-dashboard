import type { Metadata } from "next";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export function assertDeployableOrigin(origin: string, nodeEnv: string | undefined): void {
  if (nodeEnv !== "production") {
    return;
  }

  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    throw new Error("Production builds need NEXT_PUBLIC_SITE_URL to be an absolute http(s) URL.");
  }

  if ((url.protocol !== "http:" && url.protocol !== "https:") || LOCAL_HOSTS.has(url.hostname)) {
    throw new Error("Production builds need NEXT_PUBLIC_SITE_URL to be an absolute http(s) URL.");
  }
}

function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (configured) {
    assertDeployableOrigin(configured, process.env.NODE_ENV);
    return configured;
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, "");

  if (vercelHost) {
    const origin = `https://${vercelHost.replace(/^https?:\/\//, "")}`;

    assertDeployableOrigin(origin, process.env.NODE_ENV);
    return origin;
  }

  const origin = "http://localhost:3000";

  assertDeployableOrigin(origin, process.env.NODE_ENV);
  return origin;
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

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: siteConfig.name,
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${siteConfig.url}/`).href;
}

type SocialPage = {
  title?: string;
  description: string;
  canonicalPath: string;
  index?: boolean;
};

export function socialMetadata({ title, description, canonicalPath, index }: SocialPage): Metadata {
  const socialTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const url = absoluteUrl(canonicalPath);

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: canonicalPath },
    robots: index === undefined ? undefined : { index, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage.url],
    },
  };
}
