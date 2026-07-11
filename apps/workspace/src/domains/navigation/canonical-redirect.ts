import { getSupportedPersistentParams } from "./route-catalog";

export type PageSearchParams = Record<string, string | string[] | undefined>;

export function buildCanonicalRedirectPath(
  locale: string,
  destination: "/inbox" | "/channels" | "/spaces" | "/deals",
  searchParams: PageSearchParams = {},
): string {
  const query = new URLSearchParams();
  const supportedParams = getSupportedPersistentParams(destination);

  for (const param of supportedParams) {
    const value = searchParams[param];
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) {
      query.append(param, item);
    }
  }

  const queryString = query.toString();
  return `/${locale}${destination}${queryString ? `?${queryString}` : ""}`;
}
