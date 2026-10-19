"use client";

import type { MouseEvent } from "react";

import { Button, buttonClassName } from "@/shared/ui";

import { catalogQueryHref } from "../model/parse-catalog-query";
import { useCatalogNavigation } from "../provider/catalog-navigation";

type CatalogPaginationProps = {
  pageCount: number;
};

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function PageLink({
  href,
  pageNumber,
  rel,
  children,
}: {
  href: string;
  pageNumber: number;
  rel?: string;
  children: string;
}) {
  const { pushPage } = useCatalogNavigation();

  return (
    <a
      href={href}
      rel={rel}
      className={buttonClassName({ variant: "secondary", size: "compact" })}
      onClick={(event) => {
        if (!isPlainClick(event)) {
          return;
        }

        event.preventDefault();
        pushPage(pageNumber);
      }}
    >
      {children}
    </a>
  );
}

export function CatalogPagination({ pageCount }: CatalogPaginationProps) {
  const { page, filters, bounds } = useCatalogNavigation();

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
        {page <= 1 ? (
          <Button size="compact" disabled>
            Previous
          </Button>
        ) : (
          <PageLink
            href={catalogQueryHref(filters, bounds, page - 1)}
            pageNumber={page - 1}
            rel="prev"
          >
            Previous
          </PageLink>
        )}
        {pages.map((pageNumber) =>
          pageNumber === page ? (
            <span
              key={pageNumber}
              aria-current="page"
              className={buttonClassName({
                variant: "primary",
                size: "compact",
                interactive: false,
              })}
            >
              {pageNumber}
            </span>
          ) : (
            <PageLink
              key={pageNumber}
              href={catalogQueryHref(filters, bounds, pageNumber)}
              pageNumber={pageNumber}
            >
              {String(pageNumber)}
            </PageLink>
          ),
        )}
        {page >= pageCount ? (
          <Button size="compact" disabled>
            Next
          </Button>
        ) : (
          <PageLink
            href={catalogQueryHref(filters, bounds, page + 1)}
            pageNumber={page + 1}
            rel="next"
          >
            Next
          </PageLink>
        )}
      </div>
    </nav>
  );
}
