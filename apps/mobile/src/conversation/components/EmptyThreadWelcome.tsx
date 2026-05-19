import { StyleSheet, View } from "react-native";
import { useEffect, useMemo } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

import { LogoMark } from "@/foundation/icons/LogoMark";

/** Simple breathing logo animation — scales very subtly */
function BreathingLogo({ colors, color }: { colors: any; color?: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <LogoMark size={24} color={color} />
    </Animated.View>
  );
}

export function EmptyThreadWelcome() {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = resolvedColorScheme === "dark";

  return (
    <Animated.View 
      entering={FadeIn.duration(800)} 
      style={styles.container}
    >
      <View style={styles.logoWrap}>
        <BreathingLogo colors={colors} color={isDark ? "#FFFFFF" : undefined} />
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "hidden",
    paddingBottom: 40, 
  },
  logoWrap: {
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.75,
  },
});
