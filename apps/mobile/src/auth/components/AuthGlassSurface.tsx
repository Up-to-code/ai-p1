import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { type ReactNode } from "react";

import { useTheme } from "@/foundation/theme/ThemeProvider";
import { type AppColors } from "@/foundation/theme/tokens";

type AuthGlassSurfaceProps = {
  children: ReactNode;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

export function AuthGlassSurface({ children, style }: AuthGlassSurfaceProps) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = createStyles(colors, resolvedColorScheme === "dark");
  const surfaceStyle = [styles.surface, style];

  const glassEffect = getAvailableGlassEffect();
  if (glassEffect) {
    const { GlassView } = glassEffect;

    return (
      <GlassView
        colorScheme={resolvedColorScheme}
        glassEffectStyle="regular"
        isInteractive
        style={surfaceStyle}
        tintColor={resolvedColorScheme === "dark" ? "rgba(17,21,29,0.72)" : "rgba(245,247,251,0.76)"}
      >
        {children}
      </GlassView>
    );
  }

  return <View style={surfaceStyle}>{children}</View>;
}

function getAvailableGlassEffect() {
  try {
    const availability =
      require("expo-glass-effect/build/isLiquidGlassAvailable").isLiquidGlassAvailable() &&
      require("expo-glass-effect/build/isGlassEffectAPIAvailable").isGlassEffectAPIAvailable();

    if (!availability) {
      return null;
    }

    return {
      GlassView: require("expo-glass-effect/build/GlassView").default as typeof import("expo-glass-effect").GlassView,
    };
  } catch {
    return null;
  }
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  surface: {
    backgroundColor: isDark ? "rgba(12, 14, 18, 0.62)" : "rgba(245, 247, 251, 0.72)",
    borderColor: colors.divider,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
