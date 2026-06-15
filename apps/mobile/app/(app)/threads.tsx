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
import { useGlobalThreads } from "@/persistence/api/conversationData";
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
  const threadHistory = useGlobalThreads(50);
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
      <View style={styles.threadRow}>
        <Pressable style={styles.threadPress} onPress={() => openThread(item._id)}>
          <Clock size={22} color={colors.textPrimary} />
          <View style={styles.threadMeta}>
            <Text style={styles.threadTitle} numberOfLines={1}>
              {thread.title}
            </Text>
            <Text tone="muted" style={styles.threadDate} numberOfLines={1}>
              {thread.dateLabel}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.textMuted} style={mirrorIcon(isRTL)} />
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

      {!threadHistory.isLoaded ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.accent} />
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
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 22,
    textAlign: isRTL ? "right" : "left",
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: 2,
  },
  threadRow: {
    minHeight: 64,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
  },
  threadPress: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: 12,
  },
  threadMeta: {
    flex: 1,
    gap: 3,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  threadTitle: {
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 20,
    lineHeight: 27,
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
