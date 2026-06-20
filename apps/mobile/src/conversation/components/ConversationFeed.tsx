import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ArrowDown } from "lucide-react-native";
import { FlashList, type FlashListRef, type ListRenderItemInfo } from "@shopify/flash-list";

import { AssistantTurnAdapter } from "@/conversation/adapters/AssistantTurnAdapter";
import type { ThreadPresentation } from "@/conversation/assistantProtocol";
import { MessageBubble } from "@/conversation/components/MessageBubble";
import { EmptyThreadWelcome } from "@/conversation/components/EmptyThreadWelcome";
import { IconButton } from "@/foundation/primitives/IconButton";
import { Text } from "@/foundation/primitives/Text";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import { findLastIndex } from "@/foundation/utils/findLastIndex";
import { shouldShowEmptyConversationWelcome } from "@/conversation/lib/conversationTimeline";
import { logAgentDebug } from "@/conversation/lib/agentDebug";
import { SplashLoadingLogo } from "@/shell/components/SplashLoadingLogo";
import type { ConversationMessage, ConversationRunStage, ConversationTurnAction } from "@/types/domain";

type ConversationFeedProps = {
  messages: ConversationMessage[];
  runStageFeed: ConversationRunStage[];
  onTurnAction: (action: ConversationTurnAction, message: ConversationMessage) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
  onEditMessage?: (message: ConversationMessage) => void;
  onApproveConfirmation?: (confirmationId: string) => void | Promise<void>;
  onCancelConfirmation?: (confirmationId: string) => void | Promise<void>;
  showPendingConfirmationCards?: boolean;
  threadPresentation?: ThreadPresentation | null;
  hasTransientTurn?: boolean;
  isStreaming?: boolean;
  bottomContentInset?: number;
  scrollButtonBottomOffset?: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetryLoad?: () => void;
  onDismissKeyboard?: () => void;
};

const AUTO_SCROLL_THRESHOLD = 120;
const turnAdapterSafeAreaStyle = {
  width: "100%" as const,
  paddingHorizontal: theme.spacing.lg,
};

function ScrollToLatestButton({
  bottomOffset,
  contentFillsViewport,
  isAtEnd,
  onPress,
}: {
  bottomOffset: number;
  contentFillsViewport: boolean;
  isAtEnd: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets, bottomOffset, bottomOffset),
    [bottomOffset, colors, insets],
  );

  if (isAtEnd || !contentFillsViewport) {
    return null;
  }

  return (
    <View style={styles.scrollButtonWrap}>
      <IconButton onPress={onPress} style={{ backgroundColor: colors.background }}>
        <ArrowDown size={18} color={colors.textPrimary} />
      </IconButton>
    </View>
  );
}

function ThreadLoadingState() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets, 120, 120),
    [colors, insets],
  );
  const isDark = colors.background === "#000000";
  const logoColors = isDark
    ? { base: "#2A2A2A", wave: "#FFFFFF" }
    : { base: "#E0E3E7", wave: "#111111" };

  return (
    <View style={styles.threadLoadingWrap}>
      <SplashLoadingLogo baseColor={logoColors.base} waveColor={logoColors.wave} />
    </View>
  );
}

const ConversationMessageRow = React.memo(function ConversationMessageRow({
  item,
  latestStageEvent,
  activeActionMessageId,
  onEditMessage,
  onShowActions,
  onDismissActions,
  onApproveConfirmation,
  onCancelConfirmation,
  showPendingConfirmationCards,
  onTurnAction,
  onSuggestionPress,
  threadPresentation,
}: {
  item: ConversationMessage;
  latestStageEvent?: ConversationRunStage;
  activeActionMessageId: string | null;
  onEditMessage?: (message: ConversationMessage) => void;
  onShowActions: (messageId: string) => void;
  onDismissActions: () => void;
  onApproveConfirmation?: (confirmationId: string) => void | Promise<void>;
  onCancelConfirmation?: (confirmationId: string) => void | Promise<void>;
  showPendingConfirmationCards?: boolean;
  onTurnAction: (action: ConversationTurnAction, message: ConversationMessage) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
  threadPresentation?: ThreadPresentation | null;
}) {
  return (
    <View>
      <MessageBubble
        message={item}
        latestStageEvent={latestStageEvent}
        onEditMessage={onEditMessage}
        actionsVisible={activeActionMessageId === item.id}
        onShowActions={onShowActions}
        onDismissActions={onDismissActions}
        onApproveConfirmation={onApproveConfirmation}
        onCancelConfirmation={onCancelConfirmation}
        showPendingConfirmationCard={showPendingConfirmationCards}
        threadPresentation={threadPresentation}
      />

      {item.uiTurn ? (
        <Animated.View entering={FadeInDown.duration(300)} style={turnAdapterSafeAreaStyle}>
          <AssistantTurnAdapter
            message={item}
            onAction={onTurnAction}
            onSuggestionPress={onSuggestionPress}
          />
        </Animated.View>
      ) : null}
    </View>
  );
});

export function ConversationFeed({
  messages,
  runStageFeed,
  onTurnAction,
  onSuggestionPress,
  onEditMessage,
  onApproveConfirmation,
  onCancelConfirmation,
  showPendingConfirmationCards = true,
  threadPresentation,
  hasTransientTurn = false,
  isStreaming = false,
  bottomContentInset = 40,
  scrollButtonBottomOffset = bottomContentInset,
  isLoading = false,
  errorMessage,
  onRetryLoad,
  onDismissKeyboard,
}: ConversationFeedProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(colors, insets, bottomContentInset, scrollButtonBottomOffset),
    [bottomContentInset, colors, insets, scrollButtonBottomOffset],
  );
  const listRef = useRef<FlashListRef<ConversationMessage> | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const prevMessageCountRef = useRef(messages.length);
  const messageAddedFrameRef = useRef<number | null>(null);
  const viewportHeightRef = useRef(0);
  const contentHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const [isAtEnd, setIsAtEnd] = useState(true);
  const [contentFillsViewport, setContentFillsViewport] = useState(false);
  const [activeActionMessageId, setActiveActionMessageId] = useState<string | null>(null);
  const lastAssistantIndex = useMemo(
    () => findLastIndex(messages, (message) => message.role === "assistant"),
    [messages],
  );
  const latestAssistantMessage = lastAssistantIndex >= 0 ? messages[lastAssistantIndex] : null;

  const shouldShowStageProgress = useMemo(
    () => runStageFeed.some((event) => Boolean(event.route || event.specialist)),
    [runStageFeed],
  );

  const scrollToLatest = (reason: "message_added" | "streaming" | "content_size" | "manual") => {
    logAgentDebug("feed.scroll_to_latest", {
      reason,
      messageCount: messages.length,
      isAtEnd,
      contentFillsViewport,
      bottomContentInset,
    });
    listRef.current?.scrollToEnd({ animated: true });
  };

  const syncScrollState = (offsetY: number, viewportHeight: number, contentHeight: number) => {
    const nextIsAtEnd = offsetY + viewportHeight >= contentHeight - AUTO_SCROLL_THRESHOLD;
    const nextContentFillsViewport = contentHeight > viewportHeight + 1;

    shouldAutoScrollRef.current = nextIsAtEnd;
    setIsAtEnd((current) => (current === nextIsAtEnd ? current : nextIsAtEnd));
    setContentFillsViewport((current) =>
      current === nextContentFillsViewport ? current : nextContentFillsViewport,
    );
  };

  const updateAutoScrollPreference = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollOffsetRef.current = contentOffset.y;
    viewportHeightRef.current = layoutMeasurement.height;
    contentHeightRef.current = contentSize.height;
    syncScrollState(contentOffset.y, layoutMeasurement.height, contentSize.height);
  };

  const dismissKeyboard = useCallback(() => {
    if (onDismissKeyboard) {
      onDismissKeyboard();
      return;
    }
    Keyboard.dismiss();
  }, [onDismissKeyboard]);

  // Reset auto-scroll when new messages are added (user sends a message)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      shouldAutoScrollRef.current = true;
      if (messageAddedFrameRef.current !== null) {
        cancelAnimationFrame(messageAddedFrameRef.current);
      }
      messageAddedFrameRef.current = requestAnimationFrame(() => {
        messageAddedFrameRef.current = null;
        scrollToLatest("message_added");
      });
    }
    prevMessageCountRef.current = messages.length;

    return () => {
      if (messageAddedFrameRef.current !== null) {
        cancelAnimationFrame(messageAddedFrameRef.current);
        messageAddedFrameRef.current = null;
      }
    };
  }, [messages.length]);

  // Auto-scroll during assistant streaming
  useEffect(() => {
    if (!latestAssistantMessage || !shouldAutoScrollRef.current) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      scrollToLatest("streaming");
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [
    latestAssistantMessage?.id,
    latestAssistantMessage?.streamState,
    latestAssistantMessage?.text,
    latestAssistantMessage?.relatedAssetIds.length,
  ]);

  const keyExtractor = useCallback((item: ConversationMessage) => item.id, []);
  const renderItem = useCallback(({ item }: ListRenderItemInfo<ConversationMessage>) => {
    const isPending = item.id === "pending-assistant" || item.id === "streaming-assistant";
    const latestStageEvent = isPending
      ? [...runStageFeed]
          .reverse()
          .find((event) => Boolean(event.route || event.specialist))
      : undefined;

    return (
      <ConversationMessageRow
        item={item}
        latestStageEvent={latestStageEvent}
        activeActionMessageId={activeActionMessageId}
        onEditMessage={onEditMessage}
        onShowActions={setActiveActionMessageId}
        onDismissActions={() => setActiveActionMessageId(null)}
        onApproveConfirmation={onApproveConfirmation}
        onCancelConfirmation={onCancelConfirmation}
        showPendingConfirmationCards={showPendingConfirmationCards}
        onTurnAction={onTurnAction}
        onSuggestionPress={onSuggestionPress}
        threadPresentation={threadPresentation}
      />
    );
  }, [
    activeActionMessageId,
    onApproveConfirmation,
    onCancelConfirmation,
    showPendingConfirmationCards,
    onEditMessage,
    onSuggestionPress,
    onTurnAction,
    runStageFeed,
    threadPresentation,
  ]);

  const showEmptyWelcome = shouldShowEmptyConversationWelcome({
    messages,
    hasTransientTurn,
    isStreaming,
  });

  const canShowBlockingState = messages.length === 0 && !hasTransientTurn && !isStreaming;

  if (errorMessage && canShowBlockingState) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingState}>
          <Text tone="primary" style={styles.errorTitle}>
            Unable to load this thread.
          </Text>
          <Text tone="muted" style={styles.loadingText}>
            {errorMessage}
          </Text>
          {onRetryLoad ? (
            <Pressable
              onPress={onRetryLoad}
              style={({ pressed }) => [styles.retryButton, pressed ? styles.retryButtonPressed : null]}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  if (isLoading && canShowBlockingState) {
    return (
      <View style={styles.container}>
        <ThreadLoadingState />
      </View>
    );
  }

  if (showEmptyWelcome) {
    return (
      <View style={styles.container}>
        <EmptyThreadWelcome />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        onTouchStart={dismissKeyboard}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          viewportHeightRef.current = height;
          syncScrollState(scrollOffsetRef.current, height, contentHeightRef.current);
        }}
        onScroll={updateAutoScrollPreference}
        onScrollBeginDrag={() => {
          setActiveActionMessageId(null);
          dismissKeyboard();
        }}
        scrollIndicatorInsets={{
          right: Math.max(insets.right, theme.spacing.sm),
          bottom: bottomContentInset,
        }}
        onContentSizeChange={(_width, height) => {
          contentHeightRef.current = height;
          syncScrollState(scrollOffsetRef.current, viewportHeightRef.current, height);

          if (!shouldAutoScrollRef.current || !latestAssistantMessage) {
            return;
          }

          requestAnimationFrame(() => {
            scrollToLatest("content_size");
          });
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={<View style={{ height: insets.top + 50 }} />}
      />

      <ScrollToLatestButton
        bottomOffset={scrollButtonBottomOffset}
        contentFillsViewport={contentFillsViewport}
        isAtEnd={isAtEnd}
        onPress={() => {
          shouldAutoScrollRef.current = true;
          scrollToLatest("manual");
        }}
      />
    </View>
  );
}

const createStyles = (
  colors: AppColors,
  insets: EdgeInsets,
  bottomContentInset: number,
  scrollButtonBottomOffset: number,
) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing.lg,
    paddingBottom: Math.max(bottomContentInset + theme.spacing.xxl, 180),
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxxl,
  },
  loadingText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  errorTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 38,
    minWidth: 88,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    backgroundColor: colors.accent,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryText: {
    color: "#FFFFFF",
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
  },
  scrollButtonWrap: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: Math.max(scrollButtonBottomOffset, insets.bottom + theme.spacing.xxl),
    zIndex: 12,
  },
  threadLoadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: insets.bottom + 96,
  },
});
