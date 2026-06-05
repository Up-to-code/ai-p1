import { StyleSheet, useColorScheme, View } from "react-native";

import { SplashLoadingLogo } from "@/shell/components/SplashLoadingLogo";

export function FontLoadScreen() {
  const isDark = useColorScheme() === "dark";
  const colors = isDark
    ? { background: "#000000", base: "#2A2A2A", edge: "#FFFFFF", wave: "#FFFFFF" }
    : { background: "#FFFFFF", base: "#E0E3E7", edge: "#111111", wave: "#111111" };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SplashLoadingLogo baseColor={colors.base} edgeColor={colors.edge} waveColor={colors.wave} />
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
