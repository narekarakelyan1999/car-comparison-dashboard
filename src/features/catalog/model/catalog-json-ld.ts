import { absoluteUrl } from "@/config/site";

import type { Car } from "./car";
import { formatCarTitle } from "./format-car";

export function buildCarCatalogJsonLd(source: readonly Car[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cars available to compare",
    numberOfItems: source.length,
    itemListElement: source.map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Car",
        name: formatCarTitle(car),
        brand: car.brand,
        model: car.model,
        vehicleModelDate: String(car.year),
        image: absoluteUrl(car.imageSrc),
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: String(car.price),
        },
      },
    })),
  };
}
