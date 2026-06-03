import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  useSharedValue
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppLocalization } from "@/foundation/localization";

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  color?: string;
  active?: boolean;
  hapticsEnabled?: boolean;
}

export function TypewriterText({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
  color,
  active = true,
  hapticsEnabled = false,
}: TypewriterTextProps) {
  const { colors } = useTheme();
  const { isRTL } = useAppLocalization();
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const cursorOpacity = useSharedValue(1);
  const phrasesKey = phrases.join("\n");
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Blinking cursor animation
  useEffect(() => {
    if (!active) {
      cursorOpacity.value = withTiming(0, { duration: 160 });
      return;
    }
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, [active, cursorOpacity]);

  useEffect(() => {
    if (!active || phrases.length === 0) return undefined;

    const currentPhrase = phrases[phraseIndex] ?? "";
    const timer = setTimeout(() => {
      if (!isDeleting && displayText.length < currentPhrase.length) {
        const nextChar = currentPhrase.charAt(displayText.length);
        setDisplayText((previous) => previous + nextChar);
        if (hapticsEnabled && nextChar !== " ") {
          void Haptics.selectionAsync();
        }
        return;
      }

      if (!isDeleting) {
        pauseTimerRef.current = setTimeout(() => setIsDeleting(true), pauseTime);
        return;
      }

      if (displayText.length > 0) {
        setDisplayText((previous) => previous.slice(0, -1));
        return;
      }

      setIsDeleting(false);
      setPhraseIndex((previous) => (previous + 1) % phrases.length);
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [active, deletingSpeed, displayText, hapticsEnabled, isDeleting, pauseTime, phraseIndex, phrases, typingSpeed]);

  useEffect(() => {
    if (active || !pauseTimerRef.current) return;
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
  }, [active]);

  useEffect(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setDisplayText("");
    setPhraseIndex(0);
    setIsDeleting(false);
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [phrasesKey]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const resolvedColor = color ?? colors.textSecondary;

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        {isRTL ? (
          <Animated.View
            style={[styles.cursor, styles.cursorRtl, { backgroundColor: resolvedColor }, cursorStyle]}
          />
        ) : null}
        <Text
          style={[
            styles.text,
            { color: resolvedColor },
            isRTL && styles.rtlText,
          ]}
        >
        {displayText}
        </Text>
        {!isRTL ? (
          <Animated.View style={[styles.cursor, { backgroundColor: resolvedColor }, cursorStyle]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  textRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: 320,
    width: "100%",
  },
  text: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 25,
    textAlign: "center",
  },
  rtlText: {
    writingDirection: "rtl",
  },
  cursor: {
    width: 2,
    height: 20,
    marginLeft: 3,
  },
  cursorRtl: {
    marginLeft: 0,
    marginRight: 3,
  },
});
