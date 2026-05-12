export type LocationValue = {
  label: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
};

function parseCoordinate(value?: number | string | null) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function hasMapPoint(location?: LocationValue | null): location is LocationValue & { latitude: number; longitude: number } {
  return typeof location?.latitude === "number" && typeof location.longitude === "number";
}

export function buildLocationValueFromParts(input: {
  label?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
}): LocationValue | null {
  const latitude = parseCoordinate(input.latitude);
  const longitude = parseCoordinate(input.longitude);
  const city = input.city?.trim() || undefined;
  const district = input.district?.trim() || undefined;
  const label = input.label?.trim() || [city, district].filter(Boolean).join("، ");

  if (!label && latitude === undefined && longitude === undefined) {
    return null;
  }

  return {
    label: label || "نقطة محددة على الخريطة",
    city,
    district,
    latitude,
    longitude,
  };
}

export function formatLocationLabel(location?: LocationValue | null, fallback = "غير محدد") {
  return location?.label?.trim() || [location?.city, location?.district].filter(Boolean).join("، ") || fallback;
}
