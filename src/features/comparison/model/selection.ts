export const MAX_COMPARISON_CARS = 3;
export const MIN_COMPARISON_CARS = 2;

export const COMPARE_PAGE_PARAM = "ids";

export function toggleComparisonId(
  selectedIds: readonly string[],
  carId: string,
): readonly string[] {
  if (selectedIds.includes(carId)) {
    return selectedIds.filter((id) => id !== carId);
  }

  if (selectedIds.length >= MAX_COMPARISON_CARS) {
    return selectedIds;
  }

  return [...selectedIds, carId];
}

export function nextSelectionHref(
  pathname: string,
  paramName: string,
  search: string,
  carId: string,
  selectedIds: readonly string[],
): string | null {
  const next = toggleComparisonId(selectedIds, carId);

  if (next === selectedIds) {
    return null;
  }

  return replaceSelectionQuery(pathname, paramName, search, next);
}

export function isSelectionDisabled(selectedIds: readonly string[], carId: string): boolean {
  if (selectedIds.includes(carId)) {
    return false;
  }

  return selectedIds.length >= MAX_COMPARISON_CARS;
}

export function replaceSelectionQuery(
  pathname: string,
  paramName: string,
  search: string,
  nextIds: readonly string[],
): string {
  const params = new URLSearchParams(search);

  if (nextIds.length === 0) {
    params.delete(paramName);
  } else {
    params.set(paramName, nextIds.join(","));
  }

  const query = params.toString();

  if (query.length === 0) {
    return pathname;
  }

  return `${pathname}?${query}`;
}

export function compareHref(ids: readonly string[]): string {
  if (ids.length === 0) {
    return "/compare";
  }

  return `/compare?${COMPARE_PAGE_PARAM}=${ids.join(",")}`;
}

export function comparisonCanonicalPath(ids: readonly string[]): string {
  return compareHref([...ids].sort((left, right) => left.localeCompare(right)));
}
