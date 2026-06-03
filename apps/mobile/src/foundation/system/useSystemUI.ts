import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";

import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme } from "@/foundation/theme/tokens";

type ScreenClass = "compact" | "regular" | "large";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useScreenMetrics() {
  const { width, height, scale, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const screenClass: ScreenClass = shortSide <= 375 || longSide <= 812
      ? "compact"
      : shortSide >= 430 || longSide >= 900
        ? "large"
        : "regular";

    return {
      width,
      height,
      shortSide,
      longSide,
      scale,
      fontScale,
      screenClass,
      isCompact: screenClass === "compact",
      isLarge: screenClass === "large",
      isIOS: Platform.OS === "ios",
      isWeb: Platform.OS === "web",
    };
  }, [fontScale, height, scale, width]);
}

export function useGlobalSizes() {
  const metrics = useScreenMetrics();

  return useMemo(() => {
    const compact = metrics.isCompact;
    const large = metrics.isLarge;
    const buttonHeight = compact ? 50 : large ? 56 : 52;
    const buttonFontSize = compact ? 14 : 15;
    const fieldHeight = compact ? 54 : 56;

    return {
      auth: {
        horizontalPadding: compact ? 16 : 20,
        heroGap: compact ? 18 : 22,
        dockPadding: compact ? 12 : 14,
        buttonHeight,
        buttonRadius: Math.round(buttonHeight / 2),
        buttonFontSize,
        buttonLineHeight: buttonFontSize + 5,
        buttonHorizontalPadding: compact ? 18 : 22,
        labelFontSize: 13,
        fieldHeight,
        fieldRadius: compact ? 16 : 18,
        titleFontSize: compact ? 20 : 22,
        titleLineHeight: compact ? 26 : 28,
        workspaceTitleFontSize: compact ? 26 : 28,
        workspaceTitleLineHeight: compact ? 32 : 34,
        legalMaxWidth: clamp(metrics.shortSide - 48, 260, 340),
        bottomBarPadding: 10,
        bottomBarRadius: 30,
      },
    };
  }, [metrics.isCompact, metrics.isLarge, metrics.shortSide]);
}

export function useSystemUI() {
  const appTheme = useTheme();
  const metrics = useScreenMetrics();
  const sizes = useGlobalSizes();

  return useMemo(() => ({
    theme,
    colors: appTheme.colors,
    resolvedColorScheme: appTheme.resolvedColorScheme,
    metrics,
    sizes,
  }), [appTheme.colors, appTheme.resolvedColorScheme, metrics, sizes]);
}
