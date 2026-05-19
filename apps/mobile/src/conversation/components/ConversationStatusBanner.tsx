import { Pressable, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react-native";

import type { AssistantDirection } from "@/conversation/assistantProtocol";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type ConversationStatusBannerProps = {
  title: string;
  body: string;
  tone?: "info" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  direction?: AssistantDirection;
};

export function ConversationStatusBanner({
  title,
  body,
  tone = "info",
  actionLabel,
  onAction,
  onDismiss,
  direction = "ltr",
}: ConversationStatusBannerProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const Icon = useMemo(() => {
    switch (tone) {
      case "error": return AlertCircle;
      case "warning": return AlertTriangle;
      default: return Info;
    }
  }, [tone]);

  const iconColor = useMemo(() => {
    switch (tone) {
      case "error": return "#EF4444";
      case "warning": return colors.accent;
      default: return colors.textSecondary;
    }
  }, [tone, colors]);

  return (
    <View
      style={[
        styles.container,
        tone === "warning" ? styles.warning : null,
        tone === "error" ? styles.error : null,
      ]}
    >
      <View style={[styles.headerRow, direction === "rtl" && { flexDirection: "row-reverse" }]}>
        <View style={[styles.titleWrap, direction === "rtl" && { flexDirection: "row-reverse" }]}>
          <Icon size={14} color={iconColor} strokeWidth={2.5} />
          <Text variant="label" style={[styles.title, direction === "rtl" && { textAlign: "right", writingDirection: "rtl" }]}>{title}</Text>
        </View>
        {onDismiss ? (
          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <X size={14} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <Text tone="secondary" style={[styles.body, direction === "rtl" && { textAlign: "right", writingDirection: "rtl" }]}>{body}</Text>

      {actionLabel && onAction ? (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.action,
              pressed ? styles.actionPressed : null
            ]} 
            onPress={onAction}
          >
            <Text variant="caption" style={[styles.actionText, direction === "rtl" && { textAlign: "right", writingDirection: "rtl" }]}>{actionLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: theme.spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  warning: {
    backgroundColor: "#FFF6E8",
    borderColor: "#F59E0B33",
  },
  error: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  actionRow: {
    marginTop: theme.spacing.xs,
  },
  action: {
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
    backgroundColor: colors.surfaceRaised,
    // Subtle lift instead of border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    color: colors.textPrimary,
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  dismissBtn: {
    padding: 4,
  },
});
