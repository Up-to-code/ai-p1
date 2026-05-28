import { View, StyleSheet, type ViewProps } from "react-native";
import { useMemo } from "react";

import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export function Surface({ style, ...props }: ViewProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={[styles.surface, style]} {...props} />;
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
});
