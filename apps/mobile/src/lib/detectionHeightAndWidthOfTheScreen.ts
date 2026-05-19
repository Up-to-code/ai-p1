import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

type ScreenClass = "compact" | "regular" | "large";

export function useDetectionHeightAndWidthOfTheScreen() {
  const { width, height, scale, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    const aspectRatio = longSide / Math.max(shortSide, 1);

    const isCompactWidth = shortSide <= 375;
    const isCompactHeight = longSide <= 812;
    const isPhone11ProClass = shortSide <= 375 && longSide <= 812;
    const isLargePhone = shortSide >= 430 || longSide >= 900;

    const screenClass: ScreenClass = isPhone11ProClass || (isCompactWidth && isCompactHeight)
      ? "compact"
      : isLargePhone
        ? "large"
        : "regular";

    return {
      width,
      height,
      shortSide,
      longSide,
      scale,
      fontScale,
      aspectRatio,
      isCompactWidth,
      isCompactHeight,
      isPhone11ProClass,
      isLargePhone,
      screenClass,
      composerSheet: {
        topMargin: isPhone11ProClass ? 52 : isCompactHeight ? 60 : 72,
        keyboardGap: isPhone11ProClass ? 18 : isCompactHeight ? 14 : 8,
        maxHeightRatio: isPhone11ProClass ? 0.5 : isCompactHeight ? 0.53 : 0.56,
        minHeight: isPhone11ProClass ? 240 : 260,
        iconButtonSize: isPhone11ProClass ? 44 : 38,
        footerButtonSize: isPhone11ProClass ? 48 : 46,
        headerButtonHeight: isPhone11ProClass ? 44 : 38,
        headerSideWidth: isPhone11ProClass ? 78 : 64,
        horizontalPadding: isPhone11ProClass ? 14 : 16,
        titleFontSize: isPhone11ProClass ? 13 : 14,
        inputFontSize: isPhone11ProClass ? 17 : 18,
        inputLineHeight: isPhone11ProClass ? 26 : 28,
        footerTopPadding: isPhone11ProClass ? 16 : 12,
      },
      propertyCard: {
        radius: screenClass === "compact" ? 18 : screenClass === "large" ? 26 : 22,
        mediaWidth: Math.max(shortSide - 16, 1),
        imageAspectRatio: screenClass === "compact" ? 1.42 : screenClass === "large" ? 1.58 : 1.5,
        contentPadding: screenClass === "compact" ? 10 : screenClass === "large" ? 14 : 12,
        contentGap: screenClass === "compact" ? 7 : screenClass === "large" ? 11 : 9,
        titleFontSize: screenClass === "compact" ? 16 : screenClass === "large" ? 19 : 17,
        titleLineHeight: screenClass === "compact" ? 21 : screenClass === "large" ? 25 : 23,
        metaFontSize: screenClass === "compact" ? 11 : 13,
        metaLineHeight: screenClass === "compact" ? 16 : 18,
        priceFontSize: screenClass === "compact" ? 15 : screenClass === "large" ? 18 : 16,
        priceLineHeight: screenClass === "compact" ? 20 : screenClass === "large" ? 24 : 21,
        priceMaxWidth: screenClass === "compact" ? 124 : screenClass === "large" ? 152 : 136,
        badgeHeight: screenClass === "compact" ? 26 : 28,
        favoriteButtonSize: screenClass === "compact" ? 32 : 34,
        specHeight: screenClass === "compact" ? 28 : 30,
        actionHeight: screenClass === "compact" ? 40 : screenClass === "large" ? 46 : 42,
        actionRadius: screenClass === "compact" ? 14 : 16,
        iconSize: screenClass === "compact" ? 15 : 16,
        actionIconSize: screenClass === "compact" ? 20 : 22,
        actionFontSize: screenClass === "compact" ? 13 : 14,
        horizontalInset: screenClass === "compact" ? 10 : 12,
      },
    };
  }, [fontScale, height, scale, width]);
}

export type DetectionHeightAndWidthOfTheScreen = ReturnType<
  typeof useDetectionHeightAndWidthOfTheScreen
>;
