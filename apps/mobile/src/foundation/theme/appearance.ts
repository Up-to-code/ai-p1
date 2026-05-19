import type { ColorSchemeName } from "react-native";

import type { AppearanceMode } from "@/store/slices/preferenceSlice";

export function resolveAppearanceMode(
  appearanceMode: AppearanceMode,
  systemColorScheme: ColorSchemeName | null | undefined,
): "light" | "dark" {
  if (appearanceMode === "light" || appearanceMode === "dark") {
    return appearanceMode;
  }

  return systemColorScheme === "light" ? "light" : "dark";
}
