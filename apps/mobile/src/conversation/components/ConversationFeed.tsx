import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ArrowDown } from "lucide-react-native";

import { AssistantTurnAdapter } from "@/conversation/adapters/AssistantTurnAdapter";
import type { ThreadPresentation } from "@/conversation/assistantProtocol";
import { MessageBubble } from "@/conversation/components/MessageBubble";
import { EmptyThreadWelcome } from "@/conversation/components/EmptyThreadWelcome";
import { IconButton } from "@/foundation/primitives/IconButton";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { findLastIndex } from "@/foundation/utils/findLastIndex";
import type { ConversationMessage, ConversationRunStage, ConversationTurnAction } from "@/types/domain";

type ConversationFeedProps = {
  messages: ConversationMessage[];
  runStageFeed: ConversationRunStage[];
  onTurnAction: (action: ConversationTurnAction, message: ConversationMessage) => void | Promise<void>;
  onSuggestionPress?: (suggestion: string) => void;
  onEditMessage?: (message: ConversationMessage) => void;
  threadPresentation?: ThreadPresentation | null;
};

const AUTO_SCROLL_THRESHOLD = 120;

function ScrollToLatestButton({
  contentFillsViewport,
  isAtEnd,
  onPress,
}: {
  contentFillsViewport: boolean;
  isAtEnd: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

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

export function ConversationFeed({
  messages,
  runStageFeed,
  onTurnAction,
  onSuggestionPress,
  onEditMessage,
  threadPresentation,
}: ConversationFeedProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);
  const scrollViewRef = useRef<ScrollView | null>(null);
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

  const scrollToLatest = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
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

  // Reset auto-scroll when new messages are added (user sends a message)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      shouldAutoScrollRef.current = true;
      if (messageAddedFrameRef.current !== null) {
        cancelAnimationFrame(messageAddedFrameRef.current);
      }
      messageAddedFrameRef.current = requestAnimationFrame(() => {
        messageAddedFrameRef.current = null;
        scrollToLatest();
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
      scrollToLatest();
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [
    latestAssistantMessage?.id,
    latestAssistantMessage?.streamState,
    latestAssistantMessage?.text,
    latestAssistantMessage?.relatedPropertyIds.length,
  ]);

  // Show welcome screen for empty/new threads
  const hasUserMessages = messages.some((m) => m.role === "user");

  if (!hasUserMessages) {
    return (
      <View style={styles.container}>
        <EmptyThreadWelcome />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        onLayout={(event) => {
          const height = event.nativeEvent.layout.height;
          viewportHeightRef.current = height;
          syncScrollState(scrollOffsetRef.current, height, contentHeightRef.current);
        }}
        onScroll={updateAutoScrollPreference}
        onScrollBeginDrag={() => setActiveActionMessageId(null)}
        onContentSizeChange={(_width, height) => {
          contentHeightRef.current = height;
          syncScrollState(scrollOffsetRef.current, viewportHeightRef.current, height);

          if (!shouldAutoScrollRef.current || !latestAssistantMessage) {
            return;
          }

          requestAnimationFrame(() => {
            scrollToLatest();
          });
        }}
        scrollEventThrottle={16}
      >
        <View style={{ height: insets.top + 40 }} />
        {messages.map((item) => {
          const isPending = item.id === "pending-assistant";
          const latestStageEvent = isPending
            ? [...runStageFeed]
                .reverse()
                .find((event) => Boolean(event.route || event.specialist))
            : undefined;

          return (
            <View key={item.id}>
              <MessageBubble 
                message={item} 
                latestStageEvent={latestStageEvent} 
                onEditMessage={onEditMessage}
                actionsVisible={activeActionMessageId === item.id}
                onShowActions={(messageId) => setActiveActionMessageId(messageId)}
                onDismissActions={() => setActiveActionMessageId(null)}
                threadPresentation={threadPresentation}
              />

              {item.uiTurn ? (
                <Animated.View entering={FadeInDown.duration(300)}>
                  <AssistantTurnAdapter
                    message={item}
                    onAction={onTurnAction}
                    onSuggestionPress={onSuggestionPress}
                  />
                </Animated.View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <ScrollToLatestButton
        contentFillsViewport={contentFillsViewport}
        isAtEnd={isAtEnd}
        onPress={() => {
          shouldAutoScrollRef.current = true;
          scrollToLatest();
        }}
      />
    </View>
  );
}

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40,
  },
  scrollButtonWrap: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.md,
  },
});
