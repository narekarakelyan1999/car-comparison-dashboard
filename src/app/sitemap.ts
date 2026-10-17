import type { MetadataRoute } from "next";

import { catalogApi } from "@/features/catalog";

import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pageCount = catalogApi.loadPage({}).pageCount;

  return Array.from({ length: pageCount }, (_, index) => {
    const page = index + 1;

    return {
      url: page === 1 ? siteConfig.url : `${siteConfig.url}/?page=${page}`,
      changeFrequency: "monthly",
      priority: page === 1 ? 1 : 0.6,
    };
  });
}
