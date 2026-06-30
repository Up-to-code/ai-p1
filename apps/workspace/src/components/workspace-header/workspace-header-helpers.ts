import type { ViewToken } from "@/app/[locale]/(app)/ws/config/views.config";

export function getActiveViewFromParams(pathname: string, searchParams?: string): string {
  const viewFromSearch = searchParams ? new URLSearchParams(searchParams).get("view") : null;
  if (viewFromSearch) return viewFromSearch;
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  return lastSegment === "ws" ? "overview" : lastSegment;
}

export function buildPath(id: string, existingParams: string): string {
  const params = new URLSearchParams(existingParams);
  if (id === "overview") {
    params.delete("view");
  } else {
    params.set("view", id);
  }
  const qs = params.toString();
  return qs ? `/ws?${qs}` : "/ws";
}

export function resolveActiveTokens(
  activeViewIds: string[],
  allViews: ViewToken[],
): ViewToken[] {
  return activeViewIds
    .map((id) => allViews.find((v) => v.id === id))
    .filter((v): v is ViewToken => v !== undefined);
}

export function removeViewFromIds(ids: string[], idToRemove: string): string[] {
  return ids.filter((v) => v !== idToRemove);
}

export function addViewToIds(ids: string[], idToAdd: string): string[] {
  return ids.includes(idToAdd) ? ids : [...ids, idToAdd];
}

export function getFallbackViewId(ids: string[], currentId: string): string | null {
  const next = ids.filter((v) => v !== currentId);
  if (next.length === 0) return null;
  return next[next.length - 1];
}
