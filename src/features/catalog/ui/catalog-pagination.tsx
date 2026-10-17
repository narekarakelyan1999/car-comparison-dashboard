import { Button, buttonClassName, ButtonLink } from "@/shared/ui";

import type { CatalogFilters, PriceBounds } from "../model/filter-cars";
import { catalogQueryHref } from "../model/parse-catalog-query";

type CatalogPaginationProps = {
  page: number;
  pageCount: number;
  filters: CatalogFilters;
  bounds: PriceBounds;
  comparisonIds: readonly string[];
};

function pageHref(
  page: number,
  filters: CatalogFilters,
  comparisonIds: readonly string[],
  bounds: PriceBounds,
): string {
  return catalogQueryHref(filters, comparisonIds, bounds, page);
}

function PreviousPage({ page, href }: { page: number; href: string }) {
  if (page <= 1) {
    return (
      <Button size="compact" disabled>
        Previous
      </Button>
    );
  }

  return (
    <ButtonLink href={href} rel="prev" size="compact">
      Previous
    </ButtonLink>
  );
}

function NextPage({ page, pageCount, href }: { page: number; pageCount: number; href: string }) {
  if (page >= pageCount) {
    return (
      <Button size="compact" disabled>
        Next
      </Button>
    );
  }

  return (
    <ButtonLink href={href} rel="next" size="compact">
      Next
    </ButtonLink>
  );
}

function PageNumber({
  pageNumber,
  page,
  href,
}: {
  pageNumber: number;
  page: number;
  href: string;
}) {
  if (pageNumber === page) {
    return (
      <span
        aria-current="page"
        className={buttonClassName({ variant: "primary", size: "compact", interactive: false })}
      >
        {pageNumber}
      </span>
    );
  }

  return (
    <ButtonLink href={href} size="compact">
      {pageNumber}
    </ButtonLink>
  );
}

export function CatalogPagination({
  page,
  pageCount,
  filters,
  bounds,
  comparisonIds,
}: CatalogPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Catalog pages"
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-slate-700">
        Page {page} of {pageCount}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <PreviousPage page={page} href={pageHref(page - 1, filters, comparisonIds, bounds)} />
        {pages.map((pageNumber) => (
          <PageNumber
            key={pageNumber}
            pageNumber={pageNumber}
            page={page}
            href={pageHref(pageNumber, filters, comparisonIds, bounds)}
          />
        ))}
        <NextPage
          page={page}
          pageCount={pageCount}
          href={pageHref(page + 1, filters, comparisonIds, bounds)}
        />
      </div>
    </nav>
  );
}
