import { useColorScheme, StyleSheet, View } from "react-native";

import { lightColors, darkColors } from "@/foundation/theme/tokens";
import { SplashLoadingLogo } from "@/shell/components/SplashLoadingLogo";

export function AppBootScreen() {
  const isDark = useColorScheme() === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SplashLoadingLogo baseColor={colors.textMuted} waveColor={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
