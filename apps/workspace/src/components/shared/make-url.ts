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

const ORG_ID_PATTERN = /^org_[A-Za-z0-9]+$/;

function extractOrgIdFromKey(key: readonly unknown[]): string | null {
  for (const segment of key) {
    if (typeof segment === "string" && ORG_ID_PATTERN.test(segment)) {
      return segment;
    }
  }
  const fromUrl = /\/organizations\/(org_[A-Za-z0-9]+)\//.exec(key.at(-1) as string ?? "");
  return fromUrl ? fromUrl[1] : null;
}

export function debugFor(
  key: readonly unknown[],
  url: string,
  workspaceContext?: { organizationId?: string | null; workspaceStatus?: string; isConvexAuthPending?: boolean; isConvexAuthenticated?: boolean },
): QueryDebugMetadata {
  const fromKey = extractOrgIdFromKey(key);
  const organizationId =
    workspaceContext?.organizationId ?? (typeof fromKey === "string" ? fromKey : null);

  return {
    resourceType: "http",
    resourceId: url,
    path: url.split("?")[0] || "missing",
    queryKey: JSON.stringify(key),
    organizationId,
    workspaceStatus: workspaceContext?.workspaceStatus,
    isConvexAuthPending: workspaceContext?.isConvexAuthPending,
    isConvexAuthenticated: workspaceContext?.isConvexAuthenticated,
  };
}

export function placeholderForSameOrganization<TData>(url: string) {
  return ((previousData, previousQuery) => {
    const previousUrl = previousQuery?.queryKey?.at(-1);
    if (typeof previousUrl !== "string") return undefined;
    return previousUrl === url ? previousData : undefined;
  }) satisfies PlaceholderDataFunction<TData, Error, TData, readonly unknown[]>;
}
