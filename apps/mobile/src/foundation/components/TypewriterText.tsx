import React, { useState, useEffect, useCallback } from "react";
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
}

export function TypewriterText({
  phrases,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 1500,
  color,
}: TypewriterTextProps) {
  const { colors } = useTheme();
  const { isRTL } = useAppLocalization();
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const cursorOpacity = useSharedValue(1);
  const phrasesKey = phrases.join("\n");

  // Blinking cursor animation
  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      true
    );
  }, []);

  const handleTyping = useCallback(async () => {
    const currentPhrase = phrases[phraseIndex];
    
    if (!isDeleting) {
      // Typing
      if (displayText.length < currentPhrase.length) {
        const nextChar = currentPhrase.charAt(displayText.length);
        setDisplayText(prev => prev + nextChar);
        
        // Haptic feedback for each character
        if (nextChar !== " ") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Full phrase typed, pause before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      // Deleting
      if (displayText.length > 0) {
        setDisplayText(prev => prev.slice(0, -1));
        Haptics.selectionAsync(); // Subtle selection feedback for deletions
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [displayText, isDeleting, phraseIndex, phrases, pauseTime]);

  useEffect(() => {
    const timer = setTimeout(
      handleTyping,
      isDeleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, handleTyping]);

  useEffect(() => {
    setDisplayText("");
    setPhraseIndex(0);
    setIsDeleting(false);
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
    maxWidth: 310,
  },
  textRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    maxWidth: 310,
  },
  text: {
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
