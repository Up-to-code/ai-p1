import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { TextProps } from "react-native";

import { Text } from "@/foundation/primitives/Text";

type BreathingTextProps = TextProps & {
  text: string;
  duration?: number;
  minOpacity?: number;
  maxOpacity?: number;
  tone?: "primary" | "secondary" | "muted" | "accent";
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export function BreathingText({
  text,
  duration = 2000,
  minOpacity = 0.3,
  maxOpacity = 0.8,
  tone = "secondary",
  style,
  ...props
}: BreathingTextProps) {
  const opacity = useSharedValue(maxOpacity);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(minOpacity, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(maxOpacity, {
          duration: duration / 2,
          easing: Easing.inOut(Easing.quad),
        })
      ),
      -1,
      true
    );
  }, [duration, minOpacity, maxOpacity, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <AnimatedText style={[style, animatedStyle]} tone={tone} {...props}>{text}</AnimatedText>;
}
