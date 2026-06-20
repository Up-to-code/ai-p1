import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import React, { useMemo } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Check, Copy, FileText, Image as ImageIcon, Pencil, Video, X } from "lucide-react-native";

import { Text } from "@/foundation/primitives/Text";
import { MarkdownText } from "@/foundation/primitives/MarkdownText";
import { MarkdownTableViewport } from "@/foundation/primitives/MarkdownTableViewport";
import { parseMarkdownTableRows } from "@/foundation/primitives/markdownTable";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppStore } from "@/store";
import {
  getLocalizedStageMessage,
  resolveThreadPresentationState,
} from "@/conversation/lib/assistantPresentation";
import { getVisibleMessageAttachments } from "@/conversation/lib/agentAttachmentPresentation";
import {
  detectTextBlockDirection,
  getDirectionalTextAnchor,
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
  showPendingConfirmationCard?: boolean;
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

function MessageAttachmentPreview({
  attachments,
  styles,
  iconColor,
}: {
  attachments?: ConversationMessage["attachments"];
  styles: ReturnType<typeof createStyles>;
  iconColor: string;
}) {
  const { visible, overflowCount } = getVisibleMessageAttachments(attachments);
  if (visible.length === 0) return null;

  return (
    <View style={styles.sentAttachmentGrid}>
      {visible.map((attachment) => {
        const Icon = attachment.kind === "video" ? Video : attachment.kind === "image" ? ImageIcon : FileText;
        return (
          <View key={`${attachment.key}:${attachment.url}`} style={styles.sentAttachmentTile}>
            {attachment.kind === "image" ? (
              <Image source={{ uri: attachment.url }} style={styles.sentAttachmentImage} />
            ) : (
              <View style={styles.sentAttachmentIconTile}>
                <Icon size={18} color={iconColor} strokeWidth={2.2} />
              </View>
            )}
            <Text style={styles.sentAttachmentName} numberOfLines={1}>
              {attachment.name}
            </Text>
          </View>
        );
      })}
      {overflowCount > 0 ? (
        <View style={styles.sentAttachmentOverflow}>
          <Text style={styles.sentAttachmentOverflowText}>+{overflowCount}</Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Gemini-style streaming text: new words materialize smoothly
 * with staggered fade-in and subtle upward motion.
 */
function StreamingText({
  text,
  isStreaming,
  style,
  maxContentWidth,
}: {
  text: string;
  isStreaming: boolean;
  style: StyleProp<TextStyle>;
  maxContentWidth: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, colors.background === "#000000" ? "dark" : "light", maxContentWidth),
    [colors, maxContentWidth],
  );

  if (!isStreaming) {
    return <MarkdownText text={text} tone="secondary" style={style} maxContentWidth={maxContentWidth} />;
  }

  return (
    <StreamingMarkdownText
      text={text}
      style={style}
      styles={styles}
      maxContentWidth={maxContentWidth}
      backgroundColor={colors.background}
    />
  );
}

function StreamingInlineMarkdown({
  text,
  style,
  selectable = true,
  direction,
}: {
  text: string;
  style: StyleProp<TextStyle>;
  selectable?: boolean;
  direction?: "rtl" | "ltr";
}) {
  const textDirection = direction ?? detectTextBlockDirection(text);
  const parsedFullText = parseInlineMarkdown(text);

  return (
    <Text tone="secondary" selectable={selectable} style={style}>
      {getDirectionalTextAnchor(textDirection)}
      {parsedFullText}
    </Text>
  );
}

function StreamingMarkdownText({
  text,
  style,
  styles,
  maxContentWidth,
  backgroundColor,
}: {
  text: string;
  style: StyleProp<TextStyle>;
  styles: ReturnType<typeof createStyles>;
  maxContentWidth: number;
  backgroundColor: string;
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

  for (let index = 0; index < lines.length; index += 1) {
    const table = parseMarkdownTableRows(lines, index);
    if (table && !inCodeBlock) {
      blocks.push(
        <MarkdownTableViewport
          key={`table-${index}`}
          contentWidth={maxContentWidth}
          minWidth={table.minWidth}
          backgroundColor={backgroundColor}
        >
          <View style={[styles.streamingTableGrid, { width: table.minWidth }]}>
            <View style={[styles.streamingTableLine, styles.streamingTableHeaderLine]}>
              {table.headers.map((cell, cellIndex) => {
                const isBlockRtl = detectTextBlockDirection(cell) === "rtl";
                return (
                  <StreamingInlineMarkdown
                    key={`table-head-${index}-${cellIndex}`}
                    text={cell}
                    selectable={false}
                    direction={isBlockRtl ? "rtl" : "ltr"}
                    style={[
                      style,
                      styles.streamingTableHeaderCell,
                      cellIndex === table.columnCount - 1 && styles.streamingTableLastCell,
                      isBlockRtl && styles.rtlText,
                    ]}
                  />
                );
              })}
            </View>
            {table.rows.map((row, rowIndex) => (
              <View key={`table-row-${index}-${rowIndex}`} style={styles.streamingTableLine}>
                {row.map((cell, cellIndex) => {
                  const isBlockRtl = detectTextBlockDirection(cell) === "rtl";
                  return (
                    <StreamingInlineMarkdown
                      key={`table-cell-${index}-${rowIndex}-${cellIndex}`}
                      text={cell}
                      selectable={false}
                      direction={isBlockRtl ? "rtl" : "ltr"}
                      style={[
                        style,
                        styles.streamingTableCell,
                        cellIndex === table.columnCount - 1 && styles.streamingTableLastCell,
                        isBlockRtl && styles.rtlText,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </MarkdownTableViewport>
      );
      index = table.nextIndex - 1;
      continue;
    }

    const line = lines[index];
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
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (!trimmed) {
      blocks.push(<View key={`space-${index}`} style={styles.streamingSpacer} />);
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      blocks.push(
        <StreamingInlineMarkdown
          key={`heading-${index}`}
          text={headerMatch[2]}
          direction={detectTextBlockDirection(headerMatch[2])}
          style={[
            style,
            level === 1 ? styles.streamingH1 : level === 2 ? styles.streamingH2 : styles.streamingH3,
            detectTextBlockDirection(headerMatch[2]) === "rtl" && styles.rtlText,
          ]}
        />
      );
      continue;
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
            direction={isBlockRtl ? "rtl" : "ltr"}
            style={[
              style,
              styles.streamingListText,
              isBlockRtl && styles.streamingListTextRtl,
            ]}
          />
        </View>
      );
      continue;
    }

    blocks.push(
      <StreamingInlineMarkdown
        key={`paragraph-${index}`}
        text={line}
        direction={detectTextBlockDirection(line)}
        style={[
          style,
          styles.streamingParagraph,
          detectTextBlockDirection(line) === "rtl" && styles.rtlText,
        ]}
      />
    );
  }

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
  showPendingConfirmationCard = true,
  threadPresentation,
}: MessageBubbleProps) {
  const { colors, resolvedColorScheme } = useTheme();
  const { width } = useWindowDimensions();
  const maxContentWidth = Math.max(260, width - theme.spacing.lg * 2 - theme.spacing.xl);
  const styles = useMemo(
    () => createStyles(colors, resolvedColorScheme, maxContentWidth),
    [colors, maxContentWidth, resolvedColorScheme],
  );
  const localePreference = useAppStore((state) => state.localePreference);
  const isUser = message.role === "user";
  const isStreaming = message.streamState === "streaming";
  const hasCopyableText = message.text.trim().length > 0;
  const canCopyUserMessage = isUser && hasCopyableText;
  const resolvedThreadPresentation = resolveThreadPresentationState(threadPresentation);
  const pendingAssistantText = resolvedThreadPresentation.surfaceCopy.pendingAssistantText;
  const isPending =
    isStreaming && (
      message.id === "pending-assistant"
      || message.text === PENDING_PLACEHOLDER
      || message.text === LEGACY_PENDING_PLACEHOLDER
      || message.text === pendingAssistantText
    );
  const localizedStageText = latestStageEvent
    ? getLocalizedStageMessage(latestStageEvent, resolvedThreadPresentation.surfaceCopy)
    : null;
  const copyMessage = () => {
    onDismissActions?.();
    void Clipboard.setStringAsync(message.text.trim());
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
    return (
      <View style={[styles.row, styles.physicalMessageRow, styles.userPhysicalRow, { marginTop: 32 }]}>
        <View style={[styles.messageStack, styles.userStack]}>
          <Pressable
            onLongPress={showActions}
            delayLongPress={360}
            onPress={() => actionsVisible ? onDismissActions?.() : showActions()}
          >
            <View style={styles.userBubble}>
              {message.text ? (
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
              ) : null}
              <MessageAttachmentPreview
                attachments={message.attachments}
                styles={styles}
                iconColor={colors.textPrimary}
              />
            </View>
          </Pressable>
          {actionsVisible && canCopyUserMessage ? (
            <InlineMessageActions
              align="end"
              canEdit={actionsVisible && Boolean(onEditMessage)}
              direction={userDirection}
              uiLocale={isUserRtl ? "ar" : resolvedThreadPresentation.uiLocale}
              onCopy={copyMessage}
              onEdit={editMessage}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.physicalMessageRow, styles.assistantPhysicalRow, styles.assistantRow]}>
      <View style={[styles.messageStack, styles.assistantStack]}>
        {localizedStageText && isPending && (
          <View style={styles.statusLine}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {localizedStageText}
            </Text>
          </View>
        )}

        <View>
          <StreamingText
            text={message.text}
            isStreaming={isStreaming}
            maxContentWidth={maxContentWidth}
            style={[
              styles.assistantText,
            ]}
          />
        </View>
        {message.turnMeta?.confirmation && (
          showPendingConfirmationCard || message.turnMeta.confirmation.status !== "pending"
        ) ? (
          <ConfirmationCard
            confirmation={message.turnMeta.confirmation}
            onApprove={onApproveConfirmation}
            onCancel={onCancelConfirmation}
          />
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors, colorScheme: "light" | "dark", maxContentWidth = 320) => {
  const isDark = colorScheme === "dark";
  const actionSurface = isDark ? "rgba(28, 28, 30, 0.96)" : "rgba(255, 255, 255, 0.96)";
  const actionPressedSurface = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const actionShadowOpacity = isDark ? 0.22 : 0.12;

  return StyleSheet.create({
  row: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg, 
  },
  physicalMessageRow: {
    width: "100%",
    flexDirection: "column",
    direction: "ltr",
  },
  userPhysicalRow: {
    alignItems: "flex-end",
  },
  assistantPhysicalRow: {
    alignItems: "flex-start",
  },
  messageStack: {
    gap: 7,
  },
  userStack: {
    maxWidth: Math.max(180, maxContentWidth * 0.82),
    alignItems: "flex-end",
    flexShrink: 1,
  },
  assistantStack: {
    width: maxContentWidth,
    maxWidth: "100%",
    flexShrink: 1,
    alignItems: "flex-start",
  },
  assistantRow: {
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
  sentAttachmentGrid: {
    marginTop: 10,
    maxWidth: 240,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  sentAttachmentTile: {
    width: 70,
    gap: 5,
    alignItems: "center",
  },
  sentAttachmentImage: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  sentAttachmentIconTile: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sentAttachmentName: {
    width: 70,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Manrope_600SemiBold",
    textAlign: "center",
  },
  sentAttachmentOverflow: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sentAttachmentOverflowText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
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
    width: maxContentWidth,
    maxWidth: "100%",
    gap: 6,
  },
  streamingParagraph: {
    width: "100%",
    lineHeight: 24,
  },
  streamingSpacer: {
    height: 6,
  },
  streamingListItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingLeft: 2,
    marginTop: 2,
  },
  streamingListItemRtl: {
    flexDirection: "row-reverse",
    paddingLeft: 0,
    paddingRight: 2,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  streamingBullet: {
    width: 14,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
    flexShrink: 0,
  },
  streamingListText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 24,
  },
  streamingListTextRtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  streamingH1: {
    width: "100%",
    fontSize: 21,
    lineHeight: 28,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    marginTop: 8,
  },
  streamingH2: {
    width: "100%",
    fontSize: 19,
    lineHeight: 26,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    marginTop: 6,
  },
  streamingH3: {
    width: "100%",
    fontSize: 17,
    lineHeight: 24,
    fontFamily: "Manrope_700Bold",
    color: colors.textPrimary,
    marginTop: 4,
  },
  streamingTableGrid: {
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    direction: "ltr",
  },
  streamingTableLine: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  streamingTableHeaderLine: {
    borderTopWidth: 0,
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
  },
  streamingTableHeaderCell: {
    width: 220,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: colors.textPrimary,
    textAlign: "left",
    writingDirection: "ltr",
  },
  streamingTableCell: {
    width: 220,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
    writingDirection: "ltr",
  },
  streamingTableLastCell: {
    borderRightWidth: 0,
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
