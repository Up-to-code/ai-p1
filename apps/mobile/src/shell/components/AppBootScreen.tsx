import { StyleSheet, View } from "react-native";
import { useMemo } from "react";

import { Screen } from "@/foundation/primitives/Screen";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppColors } from "@/foundation/theme/tokens";

export function AppBootScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen safe={false}>
      <View style={styles.container} />
    </Screen>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
