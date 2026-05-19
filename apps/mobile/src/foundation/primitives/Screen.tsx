import { View, StyleSheet, type ViewProps } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocalization } from "@/foundation/localization";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export type ScreenProps = ViewProps & {
  safe?: boolean;
  edges?: ("top" | "bottom" | "left" | "right")[];
};

export function Screen({ style, children, safe = false, edges = ["bottom"], ...props }: ScreenProps) {
  const { colors } = useTheme();
  const { direction } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const safeStyle = safe ? {
    paddingTop: edges.includes("top") ? insets.top : 0,
    paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
    paddingLeft: edges.includes("left") ? insets.left : 0,
    paddingRight: edges.includes("right") ? insets.right : 0,
  } : {};

  return (
    <View style={styles.content}>
      <View style={[styles.inner, safeStyle, { direction }, style]} {...props}>
        {children}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
