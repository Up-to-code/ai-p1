import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Pressable, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Text } from "@/foundation/primitives/Text";
import { theme, radii } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export type PromptChipData = {
  id: string;
  label: string;
  tag?: string;
  onPress: () => void;
};

type PromptChipsProps = {
  prompts: PromptChipData[];
  variant?: "chip" | "link";
  isAr?: boolean;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
};

/**
 * A reusable, high-fidelity prompt chip list with "Magic Spring" animations.
 * Used for suggestion chips, place prompts, and quick-reply actions.
 */
export function PromptChips({
  prompts,
  variant = "chip",
  isAr = false,
  containerStyle,
  contentContainerStyle,
}: PromptChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!prompts.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={[styles.container, containerStyle, isAr && { alignSelf: "flex-end" }]}
      contentContainerStyle={[
        styles.scrollContent, 
        isAr && { flexDirection: "row-reverse" }, 
        contentContainerStyle
      ]}
    >
      {prompts.map((prompt, index) => (
        <Animated.View
          key={prompt.id}
          entering={FadeInDown.duration(300).delay(index * 30)}
        >
          <Pressable
            onPress={prompt.onPress}
            style={({ pressed }) => [
              variant === "chip" ? styles.chip : styles.link,
              pressed ? (variant === "chip" ? styles.chipPressed : styles.linkPressed) : null,
            ]}
          >
            <Text style={variant === "chip" ? styles.chipText : styles.linkText} numberOfLines={1}>
              {prompt.label}
              {prompt.tag ? (
                <Text style={styles.chipTag}>  •  {prompt.tag}</Text>
              ) : null}
            </Text>
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 8,
    },
    scrollContent: {
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      alignItems: "center",
      paddingVertical: 4, // Allow room for spring bounce shadows
    },
    chip: {
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      justifyContent: "center",
      alignItems: "center",
      // Subtle Pure Canvas shadow
      shadowColor: colors.textPrimary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    chipPressed: {
      opacity: 0.7,
      backgroundColor: colors.backgroundSoft,
      transform: [{ scale: 0.96 }],
    },
    link: {
      height: 38,
      paddingHorizontal: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    linkPressed: {
      opacity: 0.6,
      transform: [{ scale: 0.98 }],
    },
    chipText: {
      fontFamily: "Manrope_700Bold",
      fontSize: 13,
      color: colors.textPrimary,
      letterSpacing: -0.1,
    },
    chipTag: {
      fontFamily: "Manrope_500Medium",
      fontSize: 11,
      color: colors.textSecondary,
    },
    linkText: {
      fontFamily: "Manrope_700Bold",
      fontSize: 13,
      color: colors.accent,
      textDecorationLine: "underline",
    },
  });
