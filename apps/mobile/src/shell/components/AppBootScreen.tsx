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

import { Screen } from "@/foundation/primitives/Screen";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export function AppBootScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const opacity = useSharedValue(0.4);
  const letterSpacing = useSharedValue(4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    letterSpacing.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(4, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [opacity, letterSpacing]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    letterSpacing: letterSpacing.value,
  }));

  return (
    <Screen safe={false}>
      <Animated.View entering={FadeIn.duration(1500)} style={styles.container}>
        <View style={styles.content}>
          <Animated.Text style={[styles.brandName, animatedTextStyle]}>
            ZANE AI
          </Animated.Text>
        </View>
      </Animated.View>
    </Screen>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  brandName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
    textTransform: "uppercase",
  },
});
