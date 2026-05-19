import { inferPropertyType, matchesListingFilters, type ListingFilters, type PropertyTypeFilter } from "@/decision/listingFilters";
import type { PropertyCardVM } from "@/types/domain";

export const FILTER_KEYS = ["all", "forSale", "forRent", "villas", "apartments", "studios"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export type ListingSearchArgs = {
  query?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
};

export const MIN_RESULTS_BEFORE_REMOTE_EXPANSION = 3;

export function matchesQuickListingFilter(property: PropertyCardVM, filterKey: FilterKey) {
  if (filterKey === "all") {
    return true;
  }

  const combined = [
    property.title,
    property.description,
    property.aiSummary,
    ...property.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (filterKey === "apartments" || filterKey === "villas" || filterKey === "studios") {
    const expectedType: PropertyTypeFilter =
      filterKey === "apartments" ? "apartment" : filterKey === "villas" ? "villa" : "studio";
    return inferPropertyType(property) === expectedType;
  }

  if (filterKey === "forSale") {
    return (
      combined.includes("sale")
      || combined.includes("sell")
      || combined.includes("للبيع")
    );
  }

  if (filterKey === "forRent") {
    return (
      combined.includes("rent")
      || combined.includes("rental")
      || combined.includes("lease")
      || combined.includes("للإيجار")
    );
  }

  return true;
}

export function filterListingProperties(
  properties: PropertyCardVM[],
  {
    searchQuery = "",
    activeFilter = "all",
    advancedFilters,
  }: {
    searchQuery?: string;
    activeFilter?: FilterKey;
    advancedFilters: ListingFilters;
  },
) {
  let filtered = [...properties];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((property) =>
      property.title.toLowerCase().includes(q)
      || property.locationLabel.toLowerCase().includes(q),
    );
  }

  filtered = filtered.filter((property) => matchesQuickListingFilter(property, activeFilter));
  filtered = filtered.filter((property) => matchesListingFilters(property, advancedFilters));

  return filtered;
}

function parseListingPrice(value: string) {
  const parsed = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function buildListingSearchArgs({
  searchQuery = "",
  advancedFilters,
}: {
  searchQuery?: string;
  advancedFilters: ListingFilters;
}): ListingSearchArgs {
  const query = searchQuery.trim();

  return {
    query: query.length > 0 ? query : undefined,
    location: advancedFilters.locations.length === 1 ? advancedFilters.locations[0] : undefined,
    minPrice: parseListingPrice(advancedFilters.minPrice),
    maxPrice: parseListingPrice(advancedFilters.maxPrice),
    minBeds: advancedFilters.minBeds ?? undefined,
  };
}

export function mergeUniqueProperties(primary: PropertyCardVM[], secondary: PropertyCardVM[]) {
  const seen = new Set<string>();
  return [...primary, ...secondary].filter((property) => {
    if (seen.has(property.id)) {
      return false;
    }
    seen.add(property.id);
    return true;
  });
}

export function hasListingSearchIntent({
  searchQuery = "",
  activeFilter = "all",
  advancedFilters,
}: {
  searchQuery?: string;
  activeFilter?: FilterKey;
  advancedFilters: ListingFilters;
}) {
  return searchQuery.trim().length > 0
    || activeFilter !== "all"
    || advancedFilters.minPrice.trim().length > 0
    || advancedFilters.maxPrice.trim().length > 0
    || advancedFilters.locations.length > 0
    || advancedFilters.minBeds !== null
    || advancedFilters.minBaths !== null
    || advancedFilters.propertyTypes.length > 0;
}
