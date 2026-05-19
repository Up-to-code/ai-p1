import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/foundation/theme/ThemeProvider";

const BAR_COUNT = 32;
const MIN_BAR_HEIGHT = 7;
const MAX_BAR_HEIGHT = 34;
const IDLE_BAR_HEIGHT = 10;
const BASELINE_VARIATION = [
  0.88, 0.94, 1.02, 0.9, 0.98, 1.04, 0.92, 1.08,
  0.96, 1.06, 0.9, 1.1, 0.98, 1.02, 0.94, 1.05,
  0.91, 1.07, 0.97, 1.03, 0.89, 1.08, 0.95, 1.01,
  0.93, 1.04, 0.9, 1.06, 0.96, 1.02, 0.92, 0.98,
];

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function AnimatedBar({
  index,
  active,
  level,
}: {
  index: number;
  active: boolean;
  level: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const barHeight = useSharedValue(MIN_BAR_HEIGHT);
  const opacity = useSharedValue(0.34);
  const travel = useSharedValue(0);

  useEffect(() => {
    if (active) {
      travel.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1400, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      );
    } else {
      travel.value = withTiming(0, { duration: 120 });
      barHeight.value = withTiming(IDLE_BAR_HEIGHT, { duration: 180 });
      opacity.value = withTiming(0.28, { duration: 180 });
    }
  }, [active, opacity, barHeight, travel]);

  useEffect(() => {
    if (!active) return;

    const normalizedIndex = index / (BAR_COUNT - 1);
    const baseline = IDLE_BAR_HEIGHT * (BASELINE_VARIATION[index] ?? 1);
    const speechEnergy = Math.pow(level, 0.85);
    const centerBias = 1 - Math.abs(normalizedIndex - 0.5) * 0.55;
    const localRipple = (Math.sin(index * 0.75 + level * Math.PI * 2.4) + 1) / 2;
    const waveLift = speechEnergy * centerBias * (0.56 + localRipple * 0.44);
    const nextHeight = clamp(
      baseline + waveLift * (MAX_BAR_HEIGHT - baseline),
      MIN_BAR_HEIGHT,
      MAX_BAR_HEIGHT,
    );
    const nextOpacity = 0.32 + speechEnergy * 0.5 + centerBias * 0.08;

    barHeight.value = withTiming(nextHeight, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
    opacity.value = withTiming(nextOpacity, {
      duration: 110,
      easing: Easing.out(Easing.quad),
    });
  }, [active, index, level, barHeight, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    const normalizedIndex = index / (BAR_COUNT - 1);
    const leadPulseDistance = Math.abs(normalizedIndex - travel.value);
    const wrapPulseDistance = Math.abs(normalizedIndex - (travel.value - 1));
    const pulseDistance = Math.min(leadPulseDistance, wrapPulseDistance);
    const travelingBoost = active ? Math.max(0, 1 - pulseDistance / 0.17) : 0;
    const pulseScale = 1 + travelingBoost * 0.18;
    const pulseOpacity = travelingBoost * 0.18;

    return {
      height: clamp(barHeight.value * pulseScale, MIN_BAR_HEIGHT, MAX_BAR_HEIGHT),
      opacity: Math.min(opacity.value + pulseOpacity, 1),
    };
  });

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

export function RecordingVisualizer({
  active,
  level = 0,
}: {
  active: boolean;
  level?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <AnimatedBar key={i} index={i} active={active} level={level} />
      ))}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 52,
    width: "100%",
  },
  bar: {
    width: 4,
    minHeight: MIN_BAR_HEIGHT,
    borderRadius: 999,
    backgroundColor: colors.textPrimary,
  },
});
