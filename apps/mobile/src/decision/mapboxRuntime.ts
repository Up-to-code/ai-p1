import { Platform } from "react-native";

type MapboxModule = typeof import("@rnmapbox/maps");

let mapbox: MapboxModule | null = null;

if (Platform.OS === "ios" || Platform.OS === "android") {
  try {
    mapbox = require("@rnmapbox/maps") as MapboxModule;
  } catch {
    mapbox = null;
  }
}

export const mapboxModule = mapbox;
export const MapboxMapView = mapbox?.MapView ?? null;
export const MapboxCamera = mapbox?.Camera ?? null;
export const MapboxMarkerView = mapbox?.MarkerView ?? null;
export const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";
const customMapboxStyle = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL?.trim() ?? "";
const customMapboxLightStyle = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL_LIGHT?.trim() ?? "";
const customMapboxDarkStyle = process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL_DARK?.trim() ?? "";

export function initializeMapboxAccessToken() {
  if (mapbox && mapboxAccessToken) {
    void mapbox.setAccessToken(mapboxAccessToken);
  }
}

export type MapStyleType = "standard" | "satellite" | "custom";

export function getMapboxStyleURL(resolvedColorScheme: "light" | "dark", mapStyleType: MapStyleType = "standard") {
  if (mapStyleType === "satellite") {
    return mapbox?.StyleURL?.SatelliteStreet ? String(mapbox.StyleURL.SatelliteStreet) : "";
  }

  const envStyleUrl = resolvedColorScheme === "dark"
    ? customMapboxDarkStyle || customMapboxStyle
    : customMapboxLightStyle || customMapboxStyle;

  if (mapStyleType === "custom" && envStyleUrl) {
    return envStyleUrl;
  }

  if (mapStyleType === "standard" && envStyleUrl) {
    return envStyleUrl;
  }

  const styleUrl = resolvedColorScheme === "dark"
    ? mapbox?.StyleURL?.Dark ?? mapbox?.StyleURL?.Street
    : mapbox?.StyleURL?.Light ?? mapbox?.StyleURL?.Street;

  return styleUrl ? String(styleUrl) : "";
}
