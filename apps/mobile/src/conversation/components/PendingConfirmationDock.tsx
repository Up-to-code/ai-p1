import { Check, X } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import type { ConversationMessage } from "@/types/domain";

type PendingConfirmation = NonNullable<NonNullable<ConversationMessage["turnMeta"]>["confirmation"]>;

type PendingConfirmationDockProps = {
  confirmation: PendingConfirmation | null;
  bottomOffset: number;
  actionState?: {
    confirmationId: string;
    status: "approving" | "canceling" | "executed" | "canceled" | "failed";
    error?: string;
  } | null;
  onApprove?: (confirmationId: string) => void | Promise<void>;
  onCancel?: (confirmationId: string) => void | Promise<void>;
};

function parsePreviewRows(inputPreview?: string) {
  if (!inputPreview) return [];
  try {
    const value = JSON.parse(inputPreview) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.entries(value as Record<string, unknown>)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .slice(0, 5)
      .map(([key, value]) => ({
        key: key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " "),
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }));
  } catch {
    return [];
  }
}

export function PendingConfirmationDock({
  confirmation,
  bottomOffset,
  actionState,
  onApprove,
  onCancel,
}: PendingConfirmationDockProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!confirmation) {
    return null;
  }
  const currentActionState = actionState?.confirmationId === confirmation.confirmationId ? actionState : null;
  const isBusy = currentActionState?.status === "approving" || currentActionState?.status === "canceling";
  const isTerminal = currentActionState?.status === "executed" || currentActionState?.status === "canceled";
  const isFailed = currentActionState?.status === "failed";
  const previewRows = parsePreviewRows(confirmation.inputPreview);
  const showRawPreview = confirmation.inputPreview && previewRows.length === 0;
  const statusLabel = currentActionState?.status === "approving"
    ? "Running approved action..."
    : currentActionState?.status === "canceling"
      ? "Canceling action..."
      : currentActionState?.status === "executed"
        ? "Action completed"
        : currentActionState?.status === "canceled"
          ? "Action canceled"
          : currentActionState?.status === "failed"
            ? "Action failed"
            : "Approval needed";

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: bottomOffset }]}>
      <View style={styles.card}>
        <View style={styles.copy}>
          <Text tone="muted" style={[styles.status, isFailed ? styles.failedText : null]} numberOfLines={1}>
            {statusLabel}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {confirmation.summary}
          </Text>
          {previewRows.length > 0 ? (
            <View style={styles.previewTable}>
              {previewRows.map((row) => (
                <View key={row.key} style={styles.previewRow}>
                  <Text tone="muted" style={styles.previewKey} numberOfLines={1}>
                    {row.key}
                  </Text>
                  <Text style={styles.previewValue} numberOfLines={2}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : showRawPreview ? (
            <Text tone="muted" style={styles.preview} numberOfLines={2}>
              {confirmation.inputPreview}
            </Text>
          ) : null}
          {isFailed && currentActionState?.error ? (
            <Text style={styles.error} numberOfLines={2}>
              {currentActionState.error}
            </Text>
          ) : null}
        </View>
        {isBusy ? (
          <View style={styles.progressWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isTerminal ? (
          <View style={[styles.resultIcon, currentActionState?.status === "canceled" ? styles.cancelButton : styles.approveButton]}>
            {currentActionState?.status === "canceled"
              ? <X size={19} color={colors.textPrimary} strokeWidth={2.4} />
              : <Check size={20} color="#FFFFFF" strokeWidth={2.5} />}
          </View>
        ) : (
          <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel confirmation"
            hitSlop={8}
            onPress={() => onCancel?.(confirmation.confirmationId)}
            style={({ pressed }) => [styles.iconButton, styles.cancelButton, pressed ? styles.pressed : null]}
          >
            <X size={19} color={colors.textPrimary} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Approve confirmation"
            hitSlop={8}
            onPress={() => onApprove?.(confirmation.confirmationId)}
            style={({ pressed }) => [styles.iconButton, styles.approveButton, pressed ? styles.pressed : null]}
          >
            <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: "Manrope_800ExtraBold",
  },
  status: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Manrope_800ExtraBold",
    textTransform: "uppercase",
  },
  preview: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Manrope_500Medium",
  },
  previewTable: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  previewRow: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 1,
  },
  previewKey: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Manrope_700Bold",
    textTransform: "capitalize",
  },
  previewValue: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_600SemiBold",
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_600SemiBold",
  },
  failedText: {
    color: colors.danger,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
  },
  approveButton: {
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.78,
  },
  progressWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
