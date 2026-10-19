"use client";

import { createContext, type ReactNode, useCallback, useContext, useState } from "react";

import { toggleComparisonId } from "../model/selection";

type ComparisonSelection = {
  ids: readonly string[];
  toggle: (carId: string) => void;
  clear: () => void;
};

const ComparisonSelectionContext = createContext<ComparisonSelection | null>(null);

type ComparisonSelectionProviderProps = {
  children: ReactNode;
  initialIds?: readonly string[];
};

export function ComparisonSelectionProvider({
  children,
  initialIds = [],
}: ComparisonSelectionProviderProps) {
  const [ids, setIds] = useState<readonly string[]>(initialIds);
  const clear = useCallback(() => {
    setIds([]);
  }, []);

  function toggle(carId: string) {
    setIds((current) => toggleComparisonId(current, carId));
  }

  return (
    <ComparisonSelectionContext.Provider value={{ ids, toggle, clear }}>
      {children}
    </ComparisonSelectionContext.Provider>
  );
}

export function useComparisonSelection(): ComparisonSelection {
  const selection = useContext(ComparisonSelectionContext);

  if (!selection) {
    throw new Error("ComparisonSelectionProvider is missing");
  }

  return selection;
}
