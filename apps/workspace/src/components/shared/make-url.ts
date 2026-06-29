import type { PlaceholderDataFunction } from "@tanstack/react-query";
import type { QueryDebugMetadata } from "./query-debug";

export function makeUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).sort(([left], [right]) => left.localeCompare(right)).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function debugFor(key: readonly unknown[], url: string): QueryDebugMetadata {
  return {
    resourceType: "http",
    resourceId: url,
    path: url.split("?")[0] || "missing",
    queryKey: JSON.stringify(key),
  };
}

export function placeholderForSameOrganization<TData>(url: string) {
  return ((previousData, previousQuery) => {
    const previousUrl = previousQuery?.queryKey?.at(-1);
    if (typeof previousUrl !== "string") return undefined;
    return previousUrl === url ? previousData : undefined;
  }) satisfies PlaceholderDataFunction<TData, Error, TData, readonly unknown[]>;
}
