import React, { useState } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy, Check } from "lucide-react-native";

import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, radii } from "@/foundation/theme/tokens";

type CodeCardProps = {
  code: string;
  language?: string;
};

/**
 * A premium card for rendering code blocks with syntax styling and clipboard support.
 */
export function CodeCard({ code, language }: CodeCardProps) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(code.trim());
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard access failed", err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#1C1C1E", borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="label" style={styles.title}>
            {language ? language.toUpperCase() : "CODE"}
          </Text>
        </View>
        <Pressable
          onPress={onCopy}
          style={({ pressed }) => [
            styles.copyButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          {copied ? (
            <Check size={16} color="#34C759" />
          ) : (
            <Copy size={16} color="#A1A1AA" />
          )}
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <Text
          style={styles.codeText}
          selectable={true}
        >
          {code.trim()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: "Manrope_700Bold",
  },
  copyButton: {
    padding: 4,
  },
  scroll: {
    maxHeight: 400,
  },
  codeText: {
    padding: 16,
    color: "#E4E4E7",
    fontFamily: "Courier", // Fallback to system mono
    fontSize: 13,
    lineHeight: 20,
  },
});
