"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import { toggleComparisonId } from "../model/selection";

type ComparisonSelection = {
  ids: readonly string[];
  toggle: (carId: string) => void;
  replace: (nextIds: readonly string[]) => void;
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

  function toggle(carId: string) {
    setIds((current) => toggleComparisonId(current, carId));
  }

  function replace(nextIds: readonly string[]) {
    setIds(nextIds);
  }

  return (
    <ComparisonSelectionContext.Provider value={{ ids, toggle, replace }}>
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
