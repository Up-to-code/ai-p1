import { StyleSheet, View, Pressable, ScrollView, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Search,
  Settings,
  Bookmark,
  Scale,
  Plus,
  ChevronRight,
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
  const threads = useThreads();
  const startThread = useMutation(api.agent.public.startThread.startThread);
  const { canUpgrade, isAuthenticated, isGuest, user } = useAuthSession();
  const workspaceState = useQuery(
    api.partnerWorkspace.getWorkspaceState,
    isAuthenticated ? {} : "skip",
  );

  const handleNewThread = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        isGuest ? t.menu.anonymousSession : t.compare.signInRequiredTitle,
        isGuest
          ? t.auth.guestUnavailableBody
          : "Sign in to create and sync conversation threads.",
      );
      router.navigate("/(app)");
      return;
    }
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

  const displayName = isGuest
    ? t.menu.anonymousSession
    : workspaceState?.user?.name ?? user?.name ?? workspaceState?.user?.email ?? user?.email ?? "Ahmed Mansour";
  const avatarUrl = !isGuest
    ? workspaceState?.user?.image ?? user?.image ?? null
    : null;
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
                <Text style={styles.avatarText}>{initials || "Z"}</Text>
              </View>
            )}
            <View style={styles.profileMeta}>
              <Text variant="title" style={styles.profileName}>{displayName}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} style={mirrorIcon(isRTL)} />
          </Pressable>
        </Animated.View>

        {isGuest && canUpgrade && (
          <Pressable style={styles.authLink} onPress={() => router.push("/(auth)")}>
            <Text style={styles.authLinkText}>{t.menu.syncResearchArchive}</Text>
          </Pressable>
        )}

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

              {threads.slice(0, 3).map((thread: any, idx: number) => (
                <View key={thread._id}>
                  <Pressable
                    style={styles.listItem}
                    onPress={() => {
                      setActiveThreadId(thread._id);
                      router.navigate("/(app)");
                    }}
                  >
                    <View style={styles.itemIconBox}>
                      <Search size={18} color={colors.textPrimary} />
                    </View>
                    <Text variant="body" style={styles.itemLabel} numberOfLines={1}>
                      {thread.title ?? t.menu.untitledSearch}
                    </Text>
                    <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                  </Pressable>
                  {idx < 2 && <View style={styles.divider} />}
                </View>
              ))}

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
                <View style={styles.itemIconBox}><Bookmark size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.savedProperties}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.listItem} onPress={() => router.navigate("/(app)/compare")}>
                <View style={styles.itemIconBox}><Scale size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.compareTray}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.listItem} onPress={() => router.navigate("/(app)/profile")}>
                <View style={styles.itemIconBox}><Settings size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.userSettings}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.listItem} onPress={() => router.navigate("/(app)/errors")}>
                <View style={styles.itemIconBox}><AlertTriangle size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.errorScreens}</Text>
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
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.5,
    textAlign: "center",
    includeFontPadding: false,
  },
  profileMeta: {
    flex: 1,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  profileName: {
    textAlign: isRTL ? "right" : "left",
  },
  authLink: {
    marginBottom: 20,
  },
  authLinkText: {
    color: colors.accent,
    textAlign: isRTL ? "right" : "left",
  },
  menuGroups: {
    gap: 24,
  },
  groupWrapper: {
    gap: 10,
  },
  groupLabel: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 10,
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
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceRaised,
  },
  itemLabel: {
    flex: 1,
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 18,
  },
  seeAll: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  seeAllText: {
    color: colors.textMuted,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
