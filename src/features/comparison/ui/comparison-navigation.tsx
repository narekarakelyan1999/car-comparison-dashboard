"use client";

import { createContext, type ReactNode, useContext, useTransition } from "react";

type ComparisonNavigationValue = {
  isPending: boolean;
  startNavigation: (action: () => void) => void;
};

const ComparisonNavigationContext = createContext<ComparisonNavigationValue | null>(null);

export function ComparisonNavigation({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();

  function startNavigation(action: () => void) {
    startTransition(action);
  }

  return (
    <ComparisonNavigationContext.Provider value={{ isPending, startNavigation }}>
      {children}
    </ComparisonNavigationContext.Provider>
  );
}

export function useComparisonNavigation(): ComparisonNavigationValue {
  const navigation = useContext(ComparisonNavigationContext);

  if (!navigation) {
    throw new Error("ComparisonNavigation is missing");
  }

  return navigation;
}

export function ComparisonPending({ children }: { children: ReactNode }) {
  const { isPending } = useComparisonNavigation();

  return (
    <div aria-busy={isPending} className={isPending ? "opacity-60" : undefined}>
      {isPending ? <p className="sr-only">Updating comparison</p> : null}
      {children}
    </div>
  );
}
