import React, { useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  Check 
} from "lucide-react-native";

import { useTheme } from "@/foundation/theme/ThemeProvider";

type MessageActionsProps = {
  text: string;
  isArabic?: boolean;
};

/**
 * A minimalist interaction bar for assistant messages with core utilities.
 * Removed voice/speaker icon per user request.
 */
export function MessageActions({ text, isArabic }: MessageActionsProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(text.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard access failed", err);
    }
  };

  const onAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const iconColor = colors.textMuted;
  const iconSize = 15;

  return (
    <View style={[styles.container, isArabic && styles.containerRtl]}>
      <Pressable onPress={onCopy} style={styles.actionButton}>
        {copied ? (
          <Check size={iconSize} color="#34C759" />
        ) : (
          <Copy size={iconSize} color={iconColor} />
        )}
      </Pressable>

      <Pressable onPress={onAction} style={styles.actionButton}>
        <ThumbsUp size={iconSize} color={iconColor} />
      </Pressable>

      <Pressable onPress={onAction} style={styles.actionButton}>
        <ThumbsDown size={iconSize} color={iconColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2, // Further reduced from 4 for "tight" layout
    gap: 8,
  },
  containerRtl: {
    flexDirection: "row-reverse",
  },
  actionButton: {
    padding: 4,
    borderRadius: 6,
  },
});
