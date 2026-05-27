import { Linking, Pressable, StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Check, Copy, Pencil, X } from "lucide-react-native";

import { Text } from "@/foundation/primitives/Text";
import { MarkdownText } from "@/foundation/primitives/MarkdownText";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppStore } from "@/store";
import {
  getLocalizedStageMessage,
  resolveAssistantDirection,
  resolveThreadPresentationState,
} from "@/conversation/lib/assistantPresentation";
import {
  detectAssistantMessageDirection,
  detectTextBlockDirection,
  resolveMessagePhysicalSide,
  resolveUserBubbleDirection,
} from "@/conversation/lib/messageDirection";
import type { ThreadPresentation } from "@/conversation/assistantProtocol";
import type { ConversationMessage, ConversationRunStage } from "@/types/domain";

type MessageBubbleProps = {
  message: ConversationMessage;
  latestStageEvent?: ConversationRunStage;
  onEditMessage?: (message: ConversationMessage) => void;
  actionsVisible?: boolean;
  onShowActions?: (messageId: string) => void;
  onDismissActions?: () => void;
  onApproveConfirmation?: (confirmationId: string) => void | Promise<void>;
  onCancelConfirmation?: (confirmationId: string) => void | Promise<void>;
  threadPresentation?: ThreadPresentation | null;
};

const ACTION_COPY = {
  ar: { copy: "نسخ", edit: "تعديل" },
  en: { copy: "Copy", edit: "Edit" },
  fr: { copy: "Copier", edit: "Modifier" },
};

function InlineMessageActions({
  align,
  canEdit,
  direction,
  uiLocale,
  onCopy,
  onEdit,
}: {
  align: "start" | "end";
  canEdit: boolean;
  direction: "rtl" | "ltr";
  uiLocale?: "ar" | "en" | "fr" | null;
  onCopy: () => void;
  onEdit?: () => void;
}) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, resolvedColorScheme), [colors, resolvedColorScheme]);
  const isRtl = direction === "rtl";
  const copy = ACTION_COPY[uiLocale ?? (isRtl ? "ar" : "en")];
  const iconColor = colors.textPrimary;

  return (
    <Animated.View
      entering={FadeInDown.duration(140).springify().damping(18).stiffness(180)}
      style={[
        styles.actionsBar,
        align === "end" ? styles.actionsBarEnd : null,
        isRtl ? styles.actionsBarRtl : null,
      ]}
    >
      <Pressable
        hitSlop={8}
        onPress={onCopy}
        style={({ pressed }) => [styles.actionPill, pressed ? styles.actionPillPressed : null]}
      >
        <Copy size={17} color={iconColor} strokeWidth={2.2} />
        <Text style={styles.actionLabel}>{copy.copy}</Text>
      </Pressable>
      {canEdit ? (
        <Pressable
          hitSlop={8}
          onPress={onEdit}
          style={({ pressed }) => [styles.actionPill, pressed ? styles.actionPillPressed : null]}
        >
          <Pencil size={17} color={iconColor} strokeWidth={2.2} />
          <Text style={styles.actionLabel}>{copy.edit}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

function ConfirmationCard({
  confirmation,
  onApprove,
  onCancel,
}: {
  confirmation: NonNullable<ConversationMessage["turnMeta"]>["confirmation"];
  onApprove?: (confirmationId: string) => void | Promise<void>;
  onCancel?: (confirmationId: string) => void | Promise<void>;
}) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, resolvedColorScheme), [colors, resolvedColorScheme]);
  if (!confirmation) return null;
  const pending = !confirmation.status || confirmation.status === "pending";

  return (
    <View style={styles.confirmationCard}>
      <Text style={styles.confirmationTitle}>{confirmation.summary}</Text>
      {confirmation.inputPreview ? (
        <Text tone="muted" style={styles.confirmationPreview} numberOfLines={3}>
          {confirmation.inputPreview}
        </Text>
      ) : null}
      {pending ? (
        <View style={styles.confirmationActions}>
          <Pressable
            onPress={() => onApprove?.(confirmation.confirmationId)}
            style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Approve</Text>
          </Pressable>
          <Pressable
            onPress={() => onCancel?.(confirmation.confirmationId)}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
          >
            <X size={16} color={colors.textPrimary} />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Text tone="muted" style={styles.confirmationStatus}>
          {confirmation.status}
        </Text>
      )}
    </View>
  );
}

const PENDING_PLACEHOLDER = "Thinking through your request\u2026";
const LEGACY_PENDING_PLACEHOLDER = "Thinking through your request...";

/**
 * Gemini-style streaming text: new words materialize smoothly
 * with staggered fade-in and subtle upward motion.
 */
function StreamingText({
  text,
  isStreaming,
  style,
}: {
  text: string;
  isStreaming: boolean;
  style: any;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, colors.background === "#000000" ? "dark" : "light"), [colors]);

  if (!isStreaming) {
    return <MarkdownText text={text} tone="secondary" style={style} />;
  }

  return <StreamingMarkdownText text={text} style={style} styles={styles} />;
}

function StreamingInlineMarkdown({
  text,
  style,
}: {
  text: string;
  style: any;
}) {
  const parsedFullText = parseInlineMarkdown(text);

  return (
    <Text tone="secondary" selectable={true} style={style}>
      {parsedFullText}
    </Text>
  );
}

function StreamingMarkdownText({
  text,
  style,
  styles,
}: {
  text: string;
  style: any;
  styles: ReturnType<typeof createStyles>;
}) {
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBlockLanguage = "";
  let codeBlockLines: string[] = [];
  const blocks: React.ReactNode[] = [];

  const flushCodeBlock = (key: string) => {
    if (!codeBlockLines.length && !codeBlockLanguage) return;
    blocks.push(
      <View key={key} style={styles.streamingCodeBlock}>
        {codeBlockLanguage ? (
          <Text style={styles.streamingCodeLanguage}>{codeBlockLanguage}</Text>
        ) : null}
        <Text selectable={true} style={styles.streamingCodeText}>
          {codeBlockLines.join("\n")}
        </Text>
      </View>
    );
    codeBlockLines = [];
    codeBlockLanguage = "";
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const fence = trimmed.match(/^```(\w*)/);
    if (fence) {
      if (inCodeBlock) {
        flushCodeBlock(`code-${index}`);
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLanguage = fence[1] || "";
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    if (!trimmed) {
      blocks.push(<View key={`space-${index}`} style={styles.streamingSpacer} />);
      return;
    }

    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push(
        <StreamingInlineMarkdown
          key={`heading-${index}`}
          text={headerMatch[2]}
          style={[
            style,
            level === 1 ? styles.streamingH1 : level === 2 ? styles.streamingH2 : styles.streamingH3,
            detectTextBlockDirection(headerMatch[2]) === "rtl" && styles.rtlText,
          ]}
        />
      );
      return;
    }

    const listMatch = trimmed.match(/^(\d+\.|[-*•])\s+(.+)$/);
    if (listMatch) {
      const isBlockRtl = detectTextBlockDirection(listMatch[2]) === "rtl";
      blocks.push(
        <View
          key={`list-${index}`}
          style={[styles.streamingListItem, isBlockRtl && styles.streamingListItemRtl]}
        >
          <Text tone="secondary" style={[styles.streamingBullet, isBlockRtl && styles.rtlText]}>
            {listMatch[1].match(/^\d+\./) ? listMatch[1] : "•"}
          </Text>
          <StreamingInlineMarkdown
            text={listMatch[2]}
            style={[
              style,
              styles.streamingListText,
              isBlockRtl && styles.rtlText,
            ]}
          />
        </View>
      );
      return;
    }

    blocks.push(
      <StreamingInlineMarkdown
        key={`paragraph-${index}`}
        text={line}
        style={[
          style,
          styles.streamingParagraph,
          detectTextBlockDirection(line) === "rtl" && styles.rtlText,
        ]}
      />
    );
  });

  if (inCodeBlock) {
    flushCodeBlock("code-open");
  }

  return <View style={styles.streamingMarkdown}>{blocks}</View>;
}

/**
 * Simplified inline markdown parser for streaming text only.
 */
function parseInlineMarkdown(text: string) {
  // Regex: Bold (** or __), Italic (* or _), Link [t](u), Hashtag #w
  const regex = /(\*\*.*?\*\*|__.*?__|\*[^*]+\*|_[^_]+_|\[.*?\]\(.*?\)|#\w+)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    // Bold: **text** or __text__
    if ((part.startsWith("**") && part.endsWith("**") && part.length >= 4) || 
        (part.startsWith("__") && part.endsWith("__") && part.length >= 4)) {
      const content = part.slice(2, -2);
      return (
        <Text key={i} style={{ fontFamily: "Manrope_700Bold" }}>
          {content}
        </Text>
      );
    }
    // Italic: *text* or _text_
    else if ((part.startsWith("*") && part.endsWith("*") && part.length >= 2) || 
             (part.startsWith("_") && part.endsWith("_") && part.length >= 2)) {
      const content = part.slice(1, -1);
      return (
        <Text key={i} style={{ fontStyle: "italic" }}>
          {content}
        </Text>
      );
    }
    // Link: [text](url) - Styled only during streaming
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <Text
          key={i}
          style={{ color: "#007AFF", textDecorationLine: "underline", fontFamily: "Manrope_600SemiBold" }}
          onPress={() => Linking.openURL(url).catch(() => {})}
        >
          {label}
        </Text>
      );
    }
    // Hashtag: #word
    if (part.startsWith("#") && part.length > 1 && !part.includes(" ")) {
      return (
        <Text key={i} style={{ color: "#0B5CFF", fontFamily: "Manrope_700Bold" }}>
          {part}
        </Text>
      );
    }
    return part;
  });
}

export function MessageBubble({
  message,
  latestStageEvent,
  onEditMessage,
  actionsVisible = false,
  onShowActions,
  onDismissActions,
  onApproveConfirmation,
  onCancelConfirmation,
  threadPresentation,
}: MessageBubbleProps) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, resolvedColorScheme), [colors, resolvedColorScheme]);
  const localePreference = useAppStore((state) => state.localePreference);
  const isUser = message.role === "user";
  const isStreaming = message.streamState === "streaming";
  const resolvedThreadPresentation = resolveThreadPresentationState(threadPresentation);
  const pendingAssistantText = resolvedThreadPresentation.surfaceCopy.pendingAssistantText;
  const isPending =
    isStreaming && (
      message.id === "pending-assistant"
      || message.text === PENDING_PLACEHOLDER
      || message.text === LEGACY_PENDING_PLACEHOLDER
      || message.text === pendingAssistantText
    );
  const assistantDirection = isPending
    ? resolveAssistantDirection({
        turnPresentation: message.uiTurn?.presentation,
        threadPresentation: resolvedThreadPresentation,
        fallbackText: message.text,
      })
    : detectAssistantMessageDirection(message.text);
  const localizedStageText = latestStageEvent
    ? getLocalizedStageMessage(latestStageEvent, resolvedThreadPresentation.surfaceCopy)
    : null;
  const copyMessage = () => {
    onDismissActions?.();
    void Clipboard.setStringAsync(message.text);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const editMessage = () => {
    onDismissActions?.();
    onEditMessage?.(message);
  };
  const showActions = () => {
    if (message.id === "pending-assistant" || isStreaming) {
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShowActions?.(message.id);
  };

  if (isUser) {
    const userDirection = resolveUserBubbleDirection(localePreference, resolvedThreadPresentation);
    const isUserRtl = userDirection === "rtl";
    const userSide = resolveMessagePhysicalSide("user");
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.row, styles.userRow, userSide === "right" ? styles.rowRight : styles.rowLeft, { marginTop: 32 }]}
      >
        <View style={[styles.messageStack, styles.userStack, styles.stackRight]}>
          <Pressable
            onLongPress={showActions}
            delayLongPress={360}
            onPress={() => actionsVisible ? onDismissActions?.() : undefined}
          >
            <View style={styles.userBubble}>
              <Text
                tone="primary"
                selectable={true}
                style={[
                  styles.userText,
                  isUserRtl && { textAlign: "right", writingDirection: "rtl" },
                ]}
              >
                {message.text}
              </Text>
            </View>
          </Pressable>
          {actionsVisible ? (
            <InlineMessageActions
              align="end"
              canEdit={Boolean(onEditMessage)}
              direction={userDirection}
              uiLocale={isUserRtl ? "ar" : resolvedThreadPresentation.uiLocale}
              onCopy={copyMessage}
              onEdit={editMessage}
            />
          ) : null}
        </View>
      </Animated.View>
    );
  }

  const assistantSide = resolveMessagePhysicalSide("assistant");

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={[styles.row, styles.assistantRow, assistantSide === "left" ? styles.rowLeft : styles.rowRight]}
    >
      {localizedStageText && isPending && (
        <View style={styles.statusLine}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {localizedStageText}
          </Text>
        </View>
      )}

      <View style={[styles.messageStack, styles.assistantStack, styles.stackLeft]}>
          <Pressable
            onLongPress={showActions}
            delayLongPress={360}
            onPress={() => actionsVisible ? onDismissActions?.() : undefined}
          >
            <StreamingText
              text={message.text}
              isStreaming={isStreaming}
              style={[
                styles.assistantText,
              ]}
            />
          </Pressable>
          {actionsVisible ? (
            <InlineMessageActions
              align="start"
              canEdit={false}
              direction={assistantDirection}
              uiLocale={message.uiTurn?.presentation?.uiLocale ?? resolvedThreadPresentation.uiLocale}
              onCopy={copyMessage}
            />
          ) : null}
          {message.turnMeta?.confirmation ? (
            <ConfirmationCard
              confirmation={message.turnMeta.confirmation}
              onApprove={onApproveConfirmation}
              onCancel={onCancelConfirmation}
            />
          ) : null}
        </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, colorScheme: "light" | "dark") => {
  const isDark = colorScheme === "dark";
  const actionSurface = isDark ? "rgba(28, 28, 30, 0.96)" : "rgba(255, 255, 255, 0.96)";
  const actionPressedSurface = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const actionShadowOpacity = isDark ? 0.22 : 0.12;

  return StyleSheet.create({
  row: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg, 
  },
  rowLeft: {
    alignItems: "flex-start",
  },
  rowRight: {
    alignItems: "flex-end",
  },
  userRow: {
    alignItems: "flex-end",
  },
  messageStack: {
    gap: 7,
  },
  userStack: {
    width: "85%",
    alignItems: "flex-end",
  },
  assistantStack: {
    width: "92%",
    alignItems: "flex-start",
  },
  stackLeft: {
    alignSelf: "flex-start",
    marginLeft: 0,
    marginRight: "auto",
  },
  stackRight: {
    alignSelf: "flex-end",
    marginLeft: "auto",
    marginRight: 0,
  },
  assistantRow: {
    alignItems: "flex-start",
    paddingRight: theme.spacing.xl,
    marginTop: 24,
    marginBottom: 0,
  },
  userBubble: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 22,
    borderBottomRightRadius: 4,
  },
  userText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Manrope_500Medium",
  },
  brandingWrap: {
    marginBottom: 4,
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: colors.textSecondary,
  },
  assistantText: {
    lineHeight: 24,
    textAlign: "left",
    writingDirection: "ltr",
  },
  confirmationCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  confirmationTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Manrope_700Bold",
  },
  confirmationPreview: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Manrope_500Medium",
  },
  confirmationActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  confirmButton: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    backgroundColor: colors.accent,
  },
  confirmButtonPressed: {
    opacity: 0.82,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_700Bold",
  },
  cancelButton: {
    minHeight: 36,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
  },
  cancelButtonPressed: {
    opacity: 0.78,
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_700Bold",
  },
  confirmationStatus: {
    fontSize: 12,
    lineHeight: 17,
    textTransform: "capitalize",
  },
  streamingMarkdown: {
    width: "100%",
    gap: 6,
  },
  streamingParagraph: {
    lineHeight: 24,
  },
  streamingSpacer: {
    height: 6,
  },
  streamingListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingLeft: 8,
    marginTop: 2,
  },
  streamingListItemRtl: {
    flexDirection: "row-reverse",
    paddingLeft: 0,
    paddingRight: 8,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  streamingBullet: {
    minWidth: 18,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
  },
  streamingListText: {
    flex: 1,
    lineHeight: 24,
  },
  streamingH1: {
    fontSize: 21,
    lineHeight: 28,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    marginTop: 8,
  },
  streamingH2: {
    fontSize: 19,
    lineHeight: 26,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    marginTop: 6,
  },
  streamingH3: {
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
    marginTop: 4,
  },
  streamingCodeBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
  },
  streamingCodeLanguage: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  streamingCodeText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: "Courier",
    color: colors.textPrimary,
  },
  actionsBar: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 5,
    borderRadius: 18,
    backgroundColor: actionSurface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: actionShadowOpacity,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  actionsBarEnd: {
    alignSelf: "flex-end",
  },
  actionsBarRtl: {
    flexDirection: "row-reverse",
  },
  actionPill: {
    minWidth: 42,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },
  actionPillPressed: {
    backgroundColor: actionPressedSurface,
  },
  actionLabel: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: colors.textPrimary,
  },
  });
};
