import { createContext, useContext, useEffect, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import * as SystemUI from "expo-system-ui";

import { theme, lightColors, darkColors, type AppTheme } from "@/foundation/theme/tokens";
import { useAppStore } from "@/store";
import { resolveAppearanceMode } from "@/foundation/theme/appearance";
import type { AppearanceMode } from "@/store/slices/preferenceSlice";

type ThemeContextValue = {
  theme: AppTheme;
  colors: AppTheme["colors"];
  appearanceMode: AppearanceMode;
  resolvedColorScheme: "light" | "dark";
  setAppearanceMode: (value: AppearanceMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme,
  colors: theme.colors,
  appearanceMode: "system",
  resolvedColorScheme: "dark",
  setAppearanceMode: () => undefined,
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const appearanceMode = useAppStore((state) => state.appearanceMode);
  const setAppearanceMode = useAppStore((state) => state.setAppearanceMode);
  const resolvedColorScheme = resolveAppearanceMode(appearanceMode, systemColorScheme);
  const isDark = resolvedColorScheme === "dark";

  const dynamicTheme = useMemo<AppTheme>(() => ({ ...theme, colors: isDark ? darkColors : lightColors }), [isDark]);
  useEffect(() => { void SystemUI.setBackgroundColorAsync(dynamicTheme.colors.background); }, [dynamicTheme.colors.background]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: dynamicTheme,
      colors: dynamicTheme.colors,
      appearanceMode,
      resolvedColorScheme,
      setAppearanceMode,
    }),
    [appearanceMode, dynamicTheme, resolvedColorScheme, setAppearanceMode],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
