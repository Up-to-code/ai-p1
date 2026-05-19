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
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

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
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const cursorOpacity = useSharedValue(1);

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

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const resolvedColor = color ?? colors.textSecondary;

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: resolvedColor }]}>
        {displayText}
        <Animated.View style={[styles.cursor, { backgroundColor: resolvedColor }, cursorStyle]} />
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  cursor: {
    width: 2,
    height: 20,
    marginLeft: 2,
    transform: [{ translateY: 4 }],
  },
});
