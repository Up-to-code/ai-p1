import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
  Easing,
} from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Copy, Pencil } from "lucide-react-native";

import { Text } from "@/foundation/primitives/Text";
import { MarkdownText } from "@/foundation/primitives/MarkdownText";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { isArabic } from "@/foundation/utils/rtl";
import { AssistantBrandMark } from "@/conversation/components/AssistantBrandMark";
import {
  getLocalizedStageMessage,
  isRtlDirection,
  resolveAssistantBrandActivity,
  resolveAssistantDirection,
  resolveThreadPresentationState,
} from "@/conversation/lib/assistantPresentation";
import type { ThreadPresentation } from "@/conversation/assistantProtocol";
import type { ConversationMessage, ConversationRunStage } from "@/types/domain";

type MessageBubbleProps = {
  message: ConversationMessage;
  latestStageEvent?: ConversationRunStage;
  onEditMessage?: (message: ConversationMessage) => void;
  actionsVisible?: boolean;
  onShowActions?: (messageId: string) => void;
  onDismissActions?: () => void;
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

function FadeWord({ word, delay }: { word: string; delay: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: 350,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={animatedStyle}>
      {word}
    </Animated.Text>
  );
}

const PENDING_PLACEHOLDER = "Thinking through your request\u2026";

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
  const settledIndexRef = useRef(0);
  const prevTextRef = useRef("");

  // Split into words, preserving spaces
  const words = text.split(/(\s+)/);

  // When text updates during streaming, figure out what's new
  const prevWords = prevTextRef.current.split(/(\s+)/);
  const settledCount = settledIndexRef.current;

  // Once streaming ends, mark everything as settled
  useEffect(() => {
    if (!isStreaming) {
      settledIndexRef.current = words.length;
    }
  }, [isStreaming, words.length]);

  // Update prev text ref after render
  useEffect(() => {
    prevTextRef.current = text;
    if (isStreaming) {
      // Only settle words from prev render, not the new ones
      settledIndexRef.current = prevWords.length;
    }
  }, [text, isStreaming, prevWords.length]);

  if (!isStreaming) {
    // Completed — render with full markdown support (paragraphs, lists, etc)
    return <MarkdownText text={text} tone="secondary" style={style} />;
  }

  // Pre-parse the entire text to identify styled segments
  // This ensures spans like __charming bookstore__ are treated as one unit for styling
  const parsedFullText = parseInlineMarkdown(text);

  return (
    <Text tone="secondary" selectable={true} style={style}>
      {parsedFullText.map((part, i) => {
        if (typeof part === "string") {
          // Plain text segments — handle the streaming transition
          const segmentWords = part.split(/(\s+)/);
          return segmentWords.map((word, wordIdx) => {
            const absoluteWordIdx = i * 1000 + wordIdx; // Unique stable key
            if (absoluteWordIdx < settledCount) {
              return word;
            }
            return (
              <FadeWord
                key={absoluteWordIdx}
                word={word}
                delay={wordIdx * 25}
              />
            );
          });
        }
        
        // Styled segment (Text component) — reveal immediately with styling
        if (React.isValidElement(part)) {
          return React.cloneElement(part as React.ReactElement<any>, {
            key: i,
          });
        }
        
        return part;
      })}
    </Text>
  );
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
      return (
        <Text key={i} style={{ color: "#007AFF", textDecorationLine: "underline", fontFamily: "Manrope_600SemiBold" }}>
          {linkMatch[1]}
        </Text>
      );
    }
    // Hashtag: #word
    if (part.startsWith("#") && part.length > 1 && !part.includes(" ")) {
      return (
        <Text key={i} style={{ color: "#6366f1", fontFamily: "Manrope_700Bold" }}>
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
  threadPresentation,
}: MessageBubbleProps) {
  const { colors, resolvedColorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, resolvedColorScheme), [colors, resolvedColorScheme]);
  const isUser = message.role === "user";
  const isStreaming = message.streamState === "streaming";
  const isPending =
    isStreaming && (message.id === "pending-assistant" || message.text === PENDING_PLACEHOLDER);
  const resolvedThreadPresentation = resolveThreadPresentationState(threadPresentation);
  const assistantDirection = resolveAssistantDirection({
    turnPresentation: message.uiTurn?.presentation,
    threadPresentation: resolvedThreadPresentation,
    fallbackText: message.text,
  });
  const isAssistantRtl = isRtlDirection(assistantDirection);
  const localizedStageText = latestStageEvent
    ? getLocalizedStageMessage(latestStageEvent, resolvedThreadPresentation.surfaceCopy)
    : null;
  const brandActivity = resolveAssistantBrandActivity({
    threadPresentation: resolvedThreadPresentation,
    route: latestStageEvent?.route,
    stageSpecialist: latestStageEvent?.specialist,
    phase: latestStageEvent?.phase,
    stageStatus: latestStageEvent?.status,
    turn: message.uiTurn ?? null,
    streamState: message.streamState,
  });
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
    const isAr = isArabic(message.text);
    const userDirection = isAr ? "rtl" : "ltr";
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        style={[styles.row, styles.userRow, { marginTop: 32 }]}
      >
        <View style={[styles.messageStack, styles.userStack]}>
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
                  isAr && { textAlign: "right", writingDirection: "rtl" },
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
              uiLocale={isAr ? "ar" : resolvedThreadPresentation.uiLocale}
              onCopy={copyMessage}
              onEdit={editMessage}
            />
          ) : null}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(250)} style={[styles.row, styles.assistantRow, isAssistantRtl && { alignItems: "flex-end" }]}>
      <View style={[styles.brandingWrap, isAssistantRtl && { alignItems: "flex-end" }]}>
        <AssistantBrandMark
          direction={assistantDirection}
          label={brandActivity.label}
          animate={brandActivity.logoMotion}
          textMotion={brandActivity.textMotion}
          emphasis={brandActivity.emphasis}
          size={14}
        />
      </View>

      {localizedStageText && isPending && (
        <View style={[styles.statusLine, isAssistantRtl && { flexDirection: "row-reverse" }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {localizedStageText}
          </Text>
        </View>
      )}

      {!isPending ? (
        <View style={[styles.messageStack, styles.assistantStack, isAssistantRtl && styles.assistantStackRtl]}>
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
                isAssistantRtl && { textAlign: "right", writingDirection: "rtl" },
              ]}
            />
          </Pressable>
          {actionsVisible ? (
            <InlineMessageActions
              align={isAssistantRtl ? "end" : "start"}
              canEdit={false}
              direction={assistantDirection}
              uiLocale={message.uiTurn?.presentation?.uiLocale ?? resolvedThreadPresentation.uiLocale}
              onCopy={copyMessage}
            />
          ) : null}
        </View>
      ) : null}
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
  assistantStackRtl: {
    alignItems: "flex-end",
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
