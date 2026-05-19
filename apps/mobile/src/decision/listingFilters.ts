import type { PropertyCardVM } from "@/types/domain";

export const PROPERTY_TYPE_FILTERS = ["apartment", "villa", "studio"] as const;
export type PropertyTypeFilter = (typeof PROPERTY_TYPE_FILTERS)[number];

type SearchParamValue = string | string[] | undefined;

export type ListingFilters = {
  minPrice: string;
  maxPrice: string;
  locations: string[];
  minBeds: number | null;
  minBaths: number | null;
  propertyTypes: PropertyTypeFilter[];
};

export const EMPTY_LISTING_FILTERS: ListingFilters = {
  minPrice: "",
  maxPrice: "",
  locations: [],
  minBeds: null,
  minBaths: null,
  propertyTypes: [],
};

function readFirstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumericParam(value: SearchParamValue) {
  const raw = readFirstParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseCsvParam(value: SearchParamValue) {
  const raw = readFirstParam(value);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => decodeURIComponent(item).trim())
    .filter(Boolean);
}

function parsePropertyTypes(value: SearchParamValue): PropertyTypeFilter[] {
  const values = parseCsvParam(value);
  return values.filter((item): item is PropertyTypeFilter =>
    PROPERTY_TYPE_FILTERS.includes(item as PropertyTypeFilter),
  );
}

export function readListingFilters(params: Record<string, SearchParamValue>): ListingFilters {
  return {
    minPrice: readFirstParam(params.minPrice) ?? "",
    maxPrice: readFirstParam(params.maxPrice) ?? "",
    locations: parseCsvParam(params.locations),
    minBeds: parseNumericParam(params.minBeds),
    minBaths: parseNumericParam(params.minBaths),
    propertyTypes: parsePropertyTypes(params.propertyTypes),
  };
}

export function buildListingFilterParams(filters: ListingFilters) {
  return {
    minPrice: filters.minPrice.trim() || undefined,
    maxPrice: filters.maxPrice.trim() || undefined,
    locations: filters.locations.length > 0
      ? filters.locations.map((item) => encodeURIComponent(item)).join(",")
      : undefined,
    minBeds: filters.minBeds ? String(filters.minBeds) : undefined,
    minBaths: filters.minBaths ? String(filters.minBaths) : undefined,
    propertyTypes: filters.propertyTypes.length > 0 ? filters.propertyTypes.join(",") : undefined,
  };
}

export function countActiveListingFilters(filters: ListingFilters) {
  return [
    filters.minPrice.trim().length > 0,
    filters.maxPrice.trim().length > 0,
    filters.locations.length > 0,
    filters.minBeds !== null,
    filters.minBaths !== null,
    filters.propertyTypes.length > 0,
  ].filter(Boolean).length;
}

export function getAvailableListingLocations(properties: PropertyCardVM[]) {
  return [...new Set(properties.map((property) => property.locationLabel.trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "ar"));
}

export function inferPropertyType(property: PropertyCardVM): PropertyTypeFilter | null {
  const raw = [
    property.title,
    property.description,
    property.aiSummary,
    property.locationLabel,
    ...property.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    raw.includes("studio")
    || raw.includes("استوديو")
  ) {
    return "studio";
  }

  if (
    raw.includes("villa")
    || raw.includes("فيلا")
    || raw.includes("فلل")
  ) {
    return "villa";
  }

  if (
    raw.includes("apartment")
    || raw.includes("شقة")
    || raw.includes("شقق")
    || raw.includes("flat")
  ) {
    return "apartment";
  }

  return null;
}

export function getPropertyNumericPrice(property: PropertyCardVM) {
  const fromAnalysis = property.priceAnalysis.propertyAskPrice;
  if (Number.isFinite(fromAnalysis) && fromAnalysis > 0) {
    return fromAnalysis;
  }

  const digits = property.priceLabel.replace(/[^\d]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function matchesListingFilters(property: PropertyCardVM, filters: ListingFilters) {
  const numericPrice = getPropertyNumericPrice(property);
  const minPrice = Number(filters.minPrice.replace(/[^\d]/g, "")) || 0;
  const maxPrice = Number(filters.maxPrice.replace(/[^\d]/g, "")) || 0;
  const inferredType = inferPropertyType(property);

  if (minPrice > 0 && (numericPrice <= 0 || numericPrice < minPrice)) {
    return false;
  }

  if (maxPrice > 0 && (numericPrice <= 0 || numericPrice > maxPrice)) {
    return false;
  }

  if (filters.locations.length > 0 && !filters.locations.includes(property.locationLabel.trim())) {
    return false;
  }

  if (filters.minBeds !== null && property.beds < filters.minBeds) {
    return false;
  }

  if (filters.minBaths !== null && property.baths < filters.minBaths) {
    return false;
  }

  if (filters.propertyTypes.length > 0 && (!inferredType || !filters.propertyTypes.includes(inferredType))) {
    return false;
  }

  return true;
}
