import { useMemo, useState } from "react";
import type { ViewStyle } from "react-native";
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type UseScrollPositionMotionArgs = {
  threshold?: number;
  backgroundColor: string;
  borderColor: string;
};

export function useScrollPositionMotion({
  threshold = 50,
  backgroundColor,
  borderColor,
}: UseScrollPositionMotionArgs) {
  const scrollY = useSharedValue(0);
  const atTopValue = useSharedValue(1);
  const [isAtTop, setIsAtTop] = useState(true);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = Math.max(event.contentOffset.y, 0);
      const nextAtTop = y <= 0 ? 1 : 0;
      scrollY.value = y;

      if (atTopValue.value !== nextAtTop) {
        atTopValue.value = nextAtTop;
        runOnJS(setIsAtTop)(nextAtTop === 1);
      }
    },
  });

  const headerAnimatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const clampedThreshold = Math.max(threshold, 1);
    const shadowOpacity = interpolate(
      scrollY.value,
      [0, clampedThreshold],
      [0, 0.1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, clampedThreshold],
      [-8, 0],
      Extrapolation.CLAMP,
    );

    return {
      backgroundColor: interpolateColor(
        scrollY.value,
        [0, clampedThreshold],
        ["rgba(0,0,0,0)", backgroundColor],
      ),
      borderBottomColor: interpolateColor(
        scrollY.value,
        [0, clampedThreshold],
        ["rgba(0,0,0,0)", borderColor],
      ),
      shadowOpacity,
      transform: [{ translateY }],
      elevation: shadowOpacity > 0.01 ? 4 : 0,
    };
  }, [backgroundColor, borderColor, threshold]);

  const edgeAnimatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const clampedThreshold = Math.max(threshold, 1);

    return {
      opacity: interpolate(
        scrollY.value,
        [0, clampedThreshold * 0.65, clampedThreshold],
        [0, 0.45, 1],
        Extrapolation.CLAMP,
      ),
    };
  }, [threshold]);

  return useMemo(
    () => ({
      edgeAnimatedStyle,
      headerAnimatedStyle,
      isAtTop,
      onScroll,
      scrollY,
    }),
    [edgeAnimatedStyle, headerAnimatedStyle, isAtTop, onScroll, scrollY],
  );
}
