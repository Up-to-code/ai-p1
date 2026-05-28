import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { FlashList, type ListRenderItemInfo } from "@shopify/flash-list";
import { ChevronLeft, ChevronRight, Clock, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { usePaginatedAgentThreads } from "@/persistence/api/conversationData";
import type { AgentThread } from "@/persistence/api/conversationApi";
import { useAppStore } from "@/store";
import { presentThreadHistoryItem } from "@/conversation/lib/threadHistoryPresentation";

export default function ThreadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const threadHistory = usePaginatedAgentThreads(10);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);
  const favoriteThreadIds = useAppStore((state) => state.favoriteThreadIds);
  const toggleFavoriteThread = useAppStore((state) => state.toggleFavoriteThread);

  const openThread = useCallback((threadId: string) => {
    setActiveThreadId(threadId);
    router.navigate("/(app)");
  }, [router, setActiveThreadId]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<AgentThread>) => {
    const isFavorite = favoriteThreadIds.includes(item._id);
    const thread = presentThreadHistoryItem(item, { untitledLabel: t.menu.untitledSearch });
    return (
      <View style={styles.threadCard}>
        <Pressable style={styles.threadPress} onPress={() => openThread(item._id)}>
          <View style={styles.itemIconBox}>
            <Clock size={18} color={colors.textPrimary} />
          </View>
          <View style={styles.threadMeta}>
            <Text style={styles.threadTitle} numberOfLines={1}>
              {thread.title}
            </Text>
            <Text tone="muted" style={styles.threadDate} numberOfLines={1}>
              {thread.dateLabel}
            </Text>
          </View>
          <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
        </Pressable>
        <Pressable
          accessibilityLabel={t.common.save}
          onPress={() => toggleFavoriteThread(item._id)}
          hitSlop={8}
          style={styles.starButton}
        >
          <Star
            size={17}
            color={isFavorite ? colors.accent : colors.textMuted}
            fill={isFavorite ? colors.accent : "transparent"}
          />
        </Pressable>
      </View>
    );
  }, [
    colors.accent,
    colors.textMuted,
    colors.textPrimary,
    favoriteThreadIds,
    isRTL,
    openThread,
    styles,
    t.common.save,
    t.menu.untitledSearch,
    toggleFavoriteThread,
  ]);

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <BackIcon size={22} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.menu.fullHistory}</Text>
      </View>

      {threadHistory.isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : threadHistory.error ? (
        <View style={styles.centerState}>
          <Text tone="muted" style={styles.centerText}>{threadHistory.error}</Text>
          <Pressable style={styles.retryButton} onPress={threadHistory.refresh}>
            <Text style={styles.retryText}>{t.common.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={threadHistory.threads}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 72, paddingBottom: insets.bottom + theme.spacing.xl },
          ]}
          onEndReached={() => {
            if (threadHistory.hasMore && !threadHistory.isLoadingMore) void threadHistory.loadMore();
          }}
          onEndReachedThreshold={0.35}
          ListFooterComponent={
            threadHistory.isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 17,
    textAlign: isRTL ? "right" : "left",
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  threadCard: {
    minHeight: 68,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  threadPress: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  itemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  threadMeta: {
    flex: 1,
    gap: 3,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  threadTitle: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 14,
    textAlign: isRTL ? "right" : "left",
  },
  threadDate: {
    fontSize: 11,
    lineHeight: 15,
  },
  starButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  centerText: {
    textAlign: "center",
  },
  retryButton: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
    backgroundColor: colors.textPrimary,
  },
  retryText: {
    color: colors.background,
    fontFamily: "Manrope_800ExtraBold",
  },
  footerLoader: {
    paddingVertical: theme.spacing.lg,
  },
});
