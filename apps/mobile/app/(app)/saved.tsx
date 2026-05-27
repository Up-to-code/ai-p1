import { ScrollView, StyleSheet, View, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Search, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useThreads } from "@/persistence/convex/useConversationData";
import { useAppStore } from "@/store";

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, formatDate, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const [searchQuery, setSearchQuery] = useState("");
  const threads = useThreads();
  const favoriteThreadIds = useAppStore((state) => state.favoriteThreadIds);
  const toggleFavoriteThread = useAppStore((state) => state.toggleFavoriteThread);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);

  const filteredThreads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return threads
      .filter((thread: any) => favoriteThreadIds.includes(thread._id))
      .filter((thread: any) => {
        if (!query) return true;
        return `${thread.title ?? t.theories.untitled} ${thread.summary ?? ""}`.toLowerCase().includes(query);
      });
  }, [favoriteThreadIds, searchQuery, threads, t.theories.untitled]);

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={styles.headerTitle}>{t.saved.title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.search}>
          <View style={styles.searchInner}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              placeholder={t.saved.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              textAlign={isRTL ? "right" : "left"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 120, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredThreads.length === 0 ? (
          <View style={styles.emptyState}>
            <Star size={28} color={colors.textMuted} />
            <Text variant="title" style={styles.emptyTitle}>
              {searchQuery.trim().length > 0 ? t.saved.noMatchesTitle : t.saved.emptyTitle}
            </Text>
            <Text tone="secondary" style={styles.emptyBody}>
              {searchQuery.trim().length > 0 ? t.saved.noMatchesBody : t.saved.emptyBody}
            </Text>
          </View>
        ) : (
          <View style={styles.groupCard}>
            {filteredThreads.map((thread: any, index: number) => (
              <Animated.View key={thread._id} entering={FadeInDown.delay(index * 60).springify()}>
                <Pressable
                  testID={`favorites.thread.${thread._id}`}
                  style={styles.threadItem}
                  onPress={() => {
                    setActiveThreadId(thread._id);
                    router.replace("/(app)");
                  }}
                >
                  <View style={styles.threadMain}>
                    <Pressable
                      accessibilityLabel={t.saved.removeFavorite}
                      onPress={() => toggleFavoriteThread(thread._id)}
                      hitSlop={8}
                      style={styles.favoriteButton}
                    >
                      <Star size={18} color={colors.accent} fill={colors.accent} />
                    </Pressable>
                    <View style={styles.threadContent}>
                      <Text variant="body" style={styles.threadTitle} numberOfLines={1}>
                        {thread.title ?? t.theories.untitled}
                      </Text>
                      <Text variant="caption" style={styles.threadPreview} numberOfLines={1}>
                        {thread.summary ?? t.theories.openThreadBody}
                      </Text>
                    </View>
                    <View style={styles.threadMeta}>
                      <Text variant="caption" style={styles.threadTime}>
                        {formatDate(thread._creationTime)}
                      </Text>
                      <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                    </View>
                  </View>
                </Pressable>
                {index < filteredThreads.length - 1 && <View style={styles.divider} />}
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: `${colors.background}FA`,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.6,
    textAlign: "center",
    flex: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  search: {
    marginTop: 4,
  },
  searchInner: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  groupCard: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  threadItem: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  threadMain: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
  },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  threadContent: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
    textAlign: isRTL ? "right" : "left",
  },
  threadPreview: {
    fontSize: 13,
    color: colors.textSecondary,
    opacity: 0.7,
    textAlign: isRTL ? "right" : "left",
  },
  threadMeta: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
  },
  threadTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: "Manrope_700Bold",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  emptyState: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  emptyTitle: {
    color: colors.textPrimary,
    textAlign: "center",
  },
  emptyBody: {
    textAlign: "center",
    maxWidth: 280,
  },
});
