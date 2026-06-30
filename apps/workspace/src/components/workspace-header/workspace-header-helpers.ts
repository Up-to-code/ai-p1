import type { ViewToken } from "@/app/[locale]/(app)/ws/config/views.config";

export function getActiveViewFromParams(pathname: string, searchParams?: string): string {
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
  if (lastSegment !== "ws") return lastSegment;
  const viewFromSearch = searchParams ? new URLSearchParams(searchParams).get("view") : null;
  return viewFromSearch ?? "overview";
}

export function buildPath(id: string, existingParams: string): string {
  const params = new URLSearchParams(existingParams);
  params.delete("view");
  const qs = params.toString();
  const base = id === "overview" ? "/ws" : `/ws/${id}`;
  return qs ? `${base}?${qs}` : base;
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
