import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { type ReactNode } from "react";
import { GlassView } from "expo-glass-effect";

import { useTheme } from "@/foundation/theme/ThemeProvider";
import { type AppColors } from "@/foundation/theme/tokens";

type AuthGlassSurfaceProps = {
  children: ReactNode;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

export function AuthGlassSurface({ children, intensity = 54, style }: AuthGlassSurfaceProps) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = createStyles(colors, resolvedColorScheme === "dark");
  const surfaceStyle = [styles.surface, style];

  if (Platform.OS === "ios") {
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

  if (Platform.OS === "web") {
    return (
      <BlurView intensity={intensity} tint={resolvedColorScheme === "dark" ? "dark" : "light"} style={surfaceStyle}>
        {children}
      </BlurView>
    );
  }

  return <View style={surfaceStyle}>{children}</View>;
}

const createStyles = (colors: AppColors, isDark: boolean) => StyleSheet.create({
  surface: {
    backgroundColor: isDark ? "rgba(12, 14, 18, 0.62)" : "rgba(245, 247, 251, 0.72)",
    borderColor: colors.divider,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
