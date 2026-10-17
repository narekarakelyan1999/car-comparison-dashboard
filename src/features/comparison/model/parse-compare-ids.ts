export function parseCompareIds(value: string | undefined, max: number): string[] {
  if (!value) {
    return [];
  }

  const seen = new Set<string>();
  const ids: string[] = [];

  for (const part of value.split(",")) {
    const id = part.trim();

    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    ids.push(id);

    if (ids.length === max) {
      break;
    }
  }

  return ids;
}
