import type { PropertyCardVM } from "@/types/domain";

type Coordinates = NonNullable<PropertyCardVM["coordinates"]>;
export type ListingMapCamera = {
  coordinates: Coordinates;
  zoom: number;
};

export type PropertyMapPoint = {
  property: PropertyCardVM;
  coordinates: Coordinates;
  usesFallbackCoordinates: boolean;
};

const DEFAULT_MAP_CENTER: Coordinates = {
  latitude: 30.0444,
  longitude: 31.2357,
};

const KNOWN_LOCATION_COORDINATES: Array<{ matchers: string[]; coordinates: Coordinates }> = [
  {
    matchers: ["new cairo", "القاهرة الجديدة", "التجمع", "fifth settlement", "fifthsettlement"],
    coordinates: { latitude: 30.0277, longitude: 31.4913 },
  },
  {
    matchers: ["sheikh zayed", "zayed", "الشيخ زايد"],
    coordinates: { latitude: 30.0107, longitude: 30.9722 },
  },
  {
    matchers: ["6th october", "6 october", "october", "أكتوبر", "6 اكتوبر", "السادس من أكتوبر"],
    coordinates: { latitude: 29.9764, longitude: 30.9519 },
  },
  {
    matchers: ["maadi", "المعادي"],
    coordinates: { latitude: 29.9597, longitude: 31.2569 },
  },
  {
    matchers: ["zamalek", "الزمالك"],
    coordinates: { latitude: 30.0626, longitude: 31.2197 },
  },
  {
    matchers: ["heliopolis", "مصر الجديدة"],
    coordinates: { latitude: 30.0917, longitude: 31.3301 },
  },
  {
    matchers: ["nasr city", "مدينة نصر"],
    coordinates: { latitude: 30.0566, longitude: 31.3300 },
  },
  {
    matchers: ["rehab", "الرحاب"],
    coordinates: { latitude: 30.0646, longitude: 31.4897 },
  },
  {
    matchers: ["madinaty", "مدينتي"],
    coordinates: { latitude: 30.0836, longitude: 31.6356 },
  },
  {
    matchers: ["new capital", "العاصمة الإدارية", "العاصمة الادارية"],
    coordinates: { latitude: 30.0153, longitude: 31.7335 },
  },
  {
    matchers: ["giza", "الجيزة"],
    coordinates: { latitude: 30.0131, longitude: 31.2089 },
  },
  {
    matchers: ["dubai marina"],
    coordinates: { latitude: 25.0800, longitude: 55.1403 },
  },
  {
    matchers: ["business bay"],
    coordinates: { latitude: 25.1868, longitude: 55.2644 },
  },
  {
    matchers: ["palm jumeirah", "palm"],
    coordinates: { latitude: 25.1124, longitude: 55.1388 },
  },
];

function isValidCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function normalizeText(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findKnownCoordinates(property: PropertyCardVM) {
  const haystack = normalizeText([
    property.locationLabel,
    property.title,
    property.compoundName,
    property.developerName,
  ]
    .filter(Boolean)
    .join(" "));

  return KNOWN_LOCATION_COORDINATES.find(({ matchers }) =>
    matchers.some((matcher) => haystack.includes(normalizeText(matcher))),
  )?.coordinates;
}

function getHashedFallbackCoordinates(seed: string): Coordinates {
  const normalized = normalizeText(seed);
  if (!normalized) {
    return DEFAULT_MAP_CENTER;
  }

  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(index)) | 0;
  }

  const latOffset = (((hash & 0xffff) / 0xffff) - 0.5) * 0.22;
  const lngOffset = ((((hash >>> 16) & 0xffff) / 0xffff) - 0.5) * 0.28;

  return {
    latitude: DEFAULT_MAP_CENTER.latitude + latOffset,
    longitude: DEFAULT_MAP_CENTER.longitude + lngOffset,
  };
}

export function resolvePropertyCoordinates(property: PropertyCardVM): PropertyMapPoint {
  const explicit = property.coordinates;
  if (
    explicit
    && isValidCoordinate(explicit.latitude, -90, 90)
    && isValidCoordinate(explicit.longitude, -180, 180)
  ) {
    return {
      property,
      coordinates: explicit,
      usesFallbackCoordinates: false,
    };
  }

  const known = findKnownCoordinates(property);
  if (known) {
    return {
      property,
      coordinates: known,
      usesFallbackCoordinates: true,
    };
  }

  return {
    property,
    coordinates: getHashedFallbackCoordinates(`${property.locationLabel} ${property.title}`),
    usesFallbackCoordinates: true,
  };
}

export function buildPropertyMapPoints(properties: PropertyCardVM[]) {
  return properties.map(resolvePropertyCoordinates);
}

export function getMapCameraPosition(
  points: PropertyMapPoint[],
  selectedPropertyId?: string | null,
): ListingMapCamera {
  const selectedPoint = selectedPropertyId
    ? points.find((point) => point.property.id === selectedPropertyId)
    : null;

  if (selectedPoint) {
    return {
      coordinates: selectedPoint.coordinates,
      zoom: 12.8,
    };
  }

  if (points.length === 0) {
    return {
      coordinates: DEFAULT_MAP_CENTER,
      zoom: 10.6,
    };
  }

  const totals = points.reduce(
    (accumulator, point) => ({
      latitude: accumulator.latitude + point.coordinates.latitude,
      longitude: accumulator.longitude + point.coordinates.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    coordinates: {
      latitude: totals.latitude / points.length,
      longitude: totals.longitude / points.length,
    },
    zoom: points.length === 1 ? 13.6 : 10.9,
  };
}

export function toMapboxPosition(coordinates: Coordinates): [number, number] {
  return [coordinates.longitude, coordinates.latitude];
}
