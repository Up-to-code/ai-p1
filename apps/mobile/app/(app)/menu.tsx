import { StyleSheet, View, Pressable, ScrollView, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Plus,
  Settings,
  Star,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { createE2EThread } from "@/e2e/store";
import { api } from "@/persistence/convex/api";
import { useThreads } from "@/persistence/convex/useConversationData";
import { useAppStore } from "@/store";
import { useMutation, useQuery } from "convex/react";
import { useAuthSession } from "@/auth/useAuthSession";

export default function MenuScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);
  const beginThreadCreation = useAppStore((state) => state.beginThreadCreation);
  const cancelThreadCreation = useAppStore((state) => state.cancelThreadCreation);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const favoriteThreadIds = useAppStore((state) => state.favoriteThreadIds);
  const toggleFavoriteThread = useAppStore((state) => state.toggleFavoriteThread);
  const threads = useThreads();
  const startThread = useMutation(api.agent.public.startThread.startThread);
  const { isAuthenticated, user } = useAuthSession();
  const workspaceState = useQuery(
    api.partnerWorkspace.getWorkspaceState,
    isAuthenticated ? {} : "skip",
  );

  const handleNewThread = async () => {
    beginThreadCreation();
    if (e2eQaMode) {
      const threadId = createE2EThread();
      setActiveThreadId(threadId);
      router.navigate("/(app)");
      return;
    }
    try {
      const threadId = await startThread({});
      setActiveThreadId(threadId);
      router.navigate("/(app)");
    } catch (error) {
      cancelThreadCreation();
      Alert.alert(
        "Unable to start conversation",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const displayName = workspaceState?.user?.name ?? user?.name ?? workspaceState?.user?.email ?? user?.email ?? "Qentrah user";
  const avatarUrl = workspaceState?.user?.image ?? user?.image ?? null;
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <Screen safe={false}>
      <View style={[styles.header, { top: insets.top + 10 }]}>
        <Pressable
          accessibilityLabel={t.common.close}
          onPress={() => router.dismissAll()}
          style={styles.closeBtn}
        >
          <X size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.springify()} style={styles.profile}>
          <Pressable
            style={styles.profileTap}
            onPress={() => router.navigate("/(app)/profile")}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "Q"}</Text>
              </View>
            )}
            <View style={styles.profileMeta}>
              <Text variant="title" style={styles.profileName}>{displayName}</Text>
              <Text variant="caption" tone="muted">Qentrah AI</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} style={mirrorIcon(isRTL)} />
          </Pressable>
        </Animated.View>

        <View style={styles.menuGroups}>
          <View style={styles.groupWrapper}>
            <Text variant="caption" tone="muted" style={styles.groupLabel}>{t.menu.researchArchive}</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.listItem} onPress={handleNewThread}>
                <View style={styles.itemIconBox}>
                  <Plus size={18} color={colors.accent} />
                </View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.startConversation}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              {threads.slice(0, 3).map((thread: any, idx: number) => {
                const isFavorite = favoriteThreadIds.includes(thread._id);
                return (
                  <View key={thread._id}>
                    <View style={styles.threadRow}>
                      <Pressable
                        style={styles.threadPress}
                        onPress={() => {
                          setActiveThreadId(thread._id);
                          router.navigate("/(app)");
                        }}
                      >
                        <View style={styles.itemIconBox}>
                          <Clock size={18} color={colors.textPrimary} />
                        </View>
                        <Text variant="body" style={styles.itemLabel} numberOfLines={1}>
                          {thread.title ?? t.menu.untitledSearch}
                        </Text>
                        <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={isFavorite ? t.saved.removeFavorite : t.common.save}
                        onPress={() => toggleFavoriteThread(thread._id)}
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
                    {idx < 2 && <View style={styles.divider} />}
                  </View>
                );
              })}

              <Pressable
                style={styles.seeAll}
                onPress={() => router.navigate("/(app)/theories")}
              >
                <Text style={styles.seeAllText}>{t.menu.fullHistory}</Text>
                <ArrowRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>
            </View>
          </View>

          <View style={styles.groupWrapper}>
            <Text variant="caption" tone="muted" style={styles.groupLabel}>{t.menu.workspaceTools}</Text>
            <View style={styles.groupCard}>
              <Pressable style={styles.listItem} onPress={() => router.navigate("/(app)/saved")}>
                <View style={styles.itemIconBox}><Star size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.favoriteChats}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.listItem} onPress={() => router.navigate("/(app)/profile")}>
                <View style={styles.itemIconBox}><Settings size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.userSettings}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    ...(isRTL ? { left: 20 } : { right: 20 }),
    zIndex: 100,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  profile: {
    marginBottom: 24,
    marginTop: 12,
  },
  profileTap: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  profileMeta: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  menuGroups: {
    gap: 24,
  },
  groupWrapper: {
    gap: 10,
  },
  groupLabel: {
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  listItem: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  threadRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingRight: isRTL ? 0 : 12,
    paddingLeft: isRTL ? 12 : 0,
  },
  threadPress: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  starButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  itemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  seeAll: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  seeAllText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },
});
