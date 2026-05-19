import { useEffect, useMemo } from "react";
import { StyleSheet, Text as RNText, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import type { AssistantDirection } from "@/conversation/assistantProtocol";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { LogoMark } from "@/foundation/icons/LogoMark";

type AssistantBrandMarkProps = {
  direction: AssistantDirection;
  label?: string | null;
  animate?: boolean;
  textMotion?: "none" | "light_sweep";
  emphasis?: "quiet" | "active" | "stopping";
  size?: number;
};

const AnimatedGlyphText = Animated.createAnimatedComponent(RNText);
const ARABIC_LABEL_FONT = "Cairo_700Bold";
const DEFAULT_LABEL_FONT = "Manrope_700Bold";

function usesArabicScript(value: string) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value);
}

type SweepGlyphProps = {
  glyph: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
  baseColor: string;
  highlightColor: string;
  style: any;
};

function SweepGlyph({
  glyph,
  index,
  total,
  progress,
  baseColor,
  highlightColor,
  style,
}: SweepGlyphProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const normalized = total <= 1 ? 0 : index / Math.max(total - 1, 1);
    const distance = Math.abs(normalized - progress.value);
    const intensity = Math.max(0, 1 - distance / 0.24);

    return {
      color: interpolateColor(intensity, [0, 1], [baseColor, highlightColor]),
      opacity: 0.82 + intensity * 0.18,
    };
  }, [baseColor, highlightColor, index, total]);

  return (
    <AnimatedGlyphText style={[style, animatedStyle]}>
      {glyph === " " ? "\u00A0" : glyph}
    </AnimatedGlyphText>
  );
}

function AnimatedBrandLabel({
  direction,
  label,
  textMotion,
  emphasis,
  baseColor,
  highlightColor,
  styles,
}: {
  direction: AssistantDirection;
  label: string;
  textMotion: "none" | "light_sweep";
  emphasis: "quiet" | "active" | "stopping";
  baseColor: string;
  highlightColor: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const glyphs = useMemo(() => Array.from(label), [label]);
  const progress = useSharedValue(0);
  const isRtl = direction === "rtl";
  const labelFontFamily = usesArabicScript(label) ? ARABIC_LABEL_FONT : DEFAULT_LABEL_FONT;

  useEffect(() => {
    if (textMotion !== "light_sweep") {
      progress.value = withTiming(0, { duration: 160 });
      return;
    }

    progress.value = 0;
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1350, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [progress, textMotion]);

  if (textMotion !== "light_sweep") {
    return (
      <RNText
        style={[
          styles.label,
          { fontFamily: labelFontFamily },
          emphasis === "stopping" ? styles.labelStopping : null,
          isRtl ? styles.labelRtl : null,
        ]}
      >
        {label}
      </RNText>
    );
  }

  return (
    <RNText style={[styles.label, isRtl ? styles.labelRtl : null]}>
      {glyphs.map((glyph, index) => (
        <SweepGlyph
          key={`${glyph}-${index}`}
          glyph={glyph}
          index={index}
          total={glyphs.length}
          progress={progress}
          baseColor={baseColor}
          highlightColor={highlightColor}
          style={[
            styles.labelGlyph,
            { fontFamily: labelFontFamily },
            isRtl ? styles.labelGlyphRtl : null,
          ]}
        />
      ))}
    </RNText>
  );
}

export function AssistantBrandMark({
  direction,
  label,
  animate = false,
  textMotion = "none",
  emphasis = "quiet",
  size = 14,
}: AssistantBrandMarkProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(emphasis === "quiet" ? 0.92 : 1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      scale.value = withTiming(1, { duration: 180 });
      opacity.value = withTiming(emphasis === "stopping" ? 0.68 : 0.92, { duration: 180 });
      rotation.value = withTiming(0, { duration: 180 });
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 3600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [animate, emphasis, opacity, rotation, scale]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const isRtl = direction === "rtl";
  const labelBaseColor = emphasis === "stopping" ? colors.textMuted : colors.textSecondary;
  const labelHighlightColor = emphasis === "active" ? colors.textPrimary : labelBaseColor;

  return (
    <View
      style={[
        styles.container,
        styles[`container_${emphasis}`],
        isRtl && styles.containerRtl,
      ]}
    >
      <Animated.View style={spinnerStyle}>
        <Animated.View style={[styles.markWrap, styles[`markWrap_${emphasis}`], markStyle]}>
          <LogoMark
            size={size}
            color={emphasis === "stopping" ? colors.textMuted : colors.accent}
          />
        </Animated.View>
      </Animated.View>
      {label ? (
        <AnimatedBrandLabel
          direction={direction}
          label={label}
          textMotion={textMotion}
          emphasis={emphasis}
          baseColor={labelBaseColor}
          highlightColor={labelHighlightColor}
          styles={styles}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: theme.radii.pill,
    borderWidth: 0,
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  containerRtl: {
    flexDirection: "row-reverse",
  },
  container_quiet: {
    opacity: 0.96,
  },
  container_active: {
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  container_stopping: {
    backgroundColor: colors.surfaceRaised,
  },
  markWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    padding: 3,
  },
  markWrap_quiet: {
    backgroundColor: "transparent",
  },
  markWrap_active: {
    backgroundColor: "transparent",
  },
  markWrap_stopping: {
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: colors.textSecondary,
    letterSpacing: 0.1,
    includeFontPadding: false,
  },
  labelGlyph: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.2,
  },
  labelStopping: {
    color: colors.textMuted,
  },
  labelRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  labelGlyphRtl: {
    writingDirection: "rtl",
  },
});
