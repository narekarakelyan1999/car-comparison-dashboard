"use client";

import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useContext,
  useOptimistic,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import type { CatalogFilters, PriceBounds } from "../model/filter-cars";
import {
  catalogQueryHref,
  emptyCatalogFilters,
  serializeCatalogQuery,
} from "../model/parse-catalog-query";

type CatalogNavigationValue = {
  isPending: boolean;
  filters: CatalogFilters;
  bounds: PriceBounds;
  page: number;
  replaceFilters: (filters: CatalogFilters) => void;
  pushPage: (page: number) => void;
};

const CatalogNavigationContext = createContext<CatalogNavigationValue | null>(null);

type CatalogNavigationProps = {
  filters: CatalogFilters;
  bounds: PriceBounds;
  page: number;
  children: ReactNode;
};

function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function CatalogNavigation({ filters, bounds, page, children }: CatalogNavigationProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
  const [optimisticPage, setOptimisticPage] = useOptimistic(page);
  const isPending = isNavigating || optimisticFilters !== filters || optimisticPage !== page;

  function replaceFilters(next: CatalogFilters) {
    const currentQuery = serializeCatalogQuery(optimisticFilters, bounds);
    const nextQuery = serializeCatalogQuery(next, bounds);

    if (currentQuery === nextQuery) {
      return;
    }

    const href = catalogQueryHref(next, bounds);

    startTransition(() => {
      setOptimisticFilters(next);
      setOptimisticPage(1);
      router.replace(href, { scroll: false });
    });
  }

  function pushPage(nextPage: number) {
    const href = catalogQueryHref(optimisticFilters, bounds, nextPage);

    startTransition(() => {
      setOptimisticPage(nextPage);
      router.push(href);
    });
  }

  return (
    <CatalogNavigationContext.Provider
      value={{
        isPending,
        filters: optimisticFilters,
        bounds,
        page: optimisticPage,
        replaceFilters,
        pushPage,
      }}
    >
      {children}
    </CatalogNavigationContext.Provider>
  );
}

export function useCatalogNavigation(): CatalogNavigationValue {
  const navigation = useContext(CatalogNavigationContext);

  if (!navigation) {
    throw new Error("CatalogNavigation is missing");
  }

  return navigation;
}

export function CatalogPending({ children }: { children: ReactNode }) {
  const { isPending } = useCatalogNavigation();

  return (
    <div aria-busy={isPending} className={isPending ? "opacity-60" : undefined}>
      {isPending ? <p className="sr-only">Updating results</p> : null}
      {children}
    </div>
  );
}

export function CatalogClearLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { replaceFilters } = useCatalogNavigation();

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (!isPlainClick(event)) {
          return;
        }

        event.preventDefault();
        replaceFilters(emptyCatalogFilters());
      }}
    >
      {children}
    </a>
  );
}
