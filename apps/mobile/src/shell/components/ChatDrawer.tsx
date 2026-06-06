import { Image, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  AlertCircle,
  Bell,
  ChevronRight,
  Clock,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  SlideInLeft,
  SlideOutLeft,
} from "react-native-reanimated";

import { useAuthSession } from "@/auth/useAuthSession";
import { userAvatarPresentation } from "@/auth/userPresentation";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { workspaceOrganizationLabel } from "@/auth/workspaceAccess";
import { presentThreadHistoryItem } from "@/conversation/lib/threadHistoryPresentation";
import { createE2EThread } from "@/e2e/store";
import { useAppLocalization } from "@/foundation/localization";
import { Text } from "@/foundation/primitives/Text";
import { useMobileSystemUi, type MobileDrawerMetrics } from "@/foundation/system/mobileSystemUi";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppColors } from "@/foundation/theme/tokens";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { usePaginatedAgentThreads } from "@/persistence/api/conversationData";
import { useAppStore } from "@/store";

type ChatDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onNavigateProfile: () => void;
  onOpenFullHistory: () => void;
};

type ChatDrawerContentProps = Omit<ChatDrawerProps, "visible"> & {
  topInset?: number;
  bottomInset?: number;
  showClose?: boolean;
};

export function ChatDrawer({
  visible,
  onClose,
  onNavigateProfile,
  onOpenFullHistory,
}: ChatDrawerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isRTL } = useAppLocalization();
  const metrics = useMobileSystemUi().drawer;
  const styles = useMemo(() => createStyles(colors, isRTL, metrics), [colors, isRTL, metrics]);
  const drawerWidth = width;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close menu backdrop"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          entering={FadeIn.duration(110)}
          exiting={FadeOut.duration(90)}
          style={[styles.backdrop, StyleSheet.absoluteFill]}
          pointerEvents="none"
        />
        <Animated.View
          entering={SlideInLeft.duration(190)}
          exiting={SlideOutLeft.duration(150)}
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              borderRightColor: colors.divider,
            },
          ]}
        >
          <ChatDrawerContent
            onClose={onClose}
            onNavigateProfile={onNavigateProfile}
            onOpenFullHistory={onOpenFullHistory}
            topInset={0}
            bottomInset={0}
            showClose
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

export function ChatDrawerContent({
  onClose,
  onNavigateProfile,
  onOpenFullHistory,
  topInset = 0,
  bottomInset = 0,
  showClose = true,
}: ChatDrawerContentProps) {
  const router = useRouter();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const metrics = useMobileSystemUi().drawer;
  const styles = useMemo(() => createStyles(colors, isRTL, metrics), [colors, isRTL, metrics]);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);
  const beginThreadCreation = useAppStore((state) => state.beginThreadCreation);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const favoriteThreadIds = useAppStore((state) => state.favoriteThreadIds);
  const toggleFavoriteThread = useAppStore((state) => state.toggleFavoriteThread);
  const threadHistory = usePaginatedAgentThreads(10);
  const { user } = useAuthSession();
  const workspace = useWorkspaceAccess();

  const { displayName, avatarUrl, initials } = userAvatarPresentation(user);
  const activeWorkspaceName = workspaceOrganizationLabel(
    workspace.activeOrganization,
    t.workspaceAccess.untitledWorkspace,
  );
  const inverseBackground = resolvedColorScheme === "dark" ? "#FFFFFF" : "#000000";
  const inverseForeground = resolvedColorScheme === "dark" ? "#000000" : "#FFFFFF";

  const handleNewThread = () => {
    beginThreadCreation();
    if (e2eQaMode) {
      setActiveThreadId(createE2EThread());
    } else {
      setActiveThreadId(null);
    }
    onClose();
  };

  const navigateAfterClose = (route: string) => {
    onClose();
    router.navigate(route as never);
  };

  return (
    <View style={styles.contentRoot}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topInset + metrics.contentTop,
            paddingBottom: bottomInset + metrics.contentBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.brandTitle}>Qentrah</Text>
          <View style={styles.topActions}>
            <Pressable
              accessibilityLabel={t.common.search}
              hitSlop={8}
              onPress={onOpenFullHistory}
              style={styles.headerIconButton}
            >
              <Search size={metrics.headerIcon} color={colors.textPrimary} />
            </Pressable>
            <Pressable accessibilityLabel={t.common.profile} onPress={onNavigateProfile} style={styles.headerAvatarButton}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.headerAvatarImage} />
              ) : (
                <View style={styles.headerAvatar}>
                  <Text style={styles.headerAvatarText}>{initials || "Q"}</Text>
                </View>
              )}
            </Pressable>
            {showClose ? (
              <Pressable
                testID="menu.close"
                accessibilityLabel={t.common.close}
                onPress={onClose}
                style={styles.headerIconButton}
              >
                <X size={metrics.headerIcon} color={colors.textPrimary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <Animated.View entering={FadeInUp.springify()} style={styles.identityBlock}>
          <Pressable testID="menu.profile" style={styles.identityTap} onPress={onNavigateProfile}>
            <View style={styles.identityMeta}>
              <Text variant="title" style={styles.identityName}>{displayName}</Text>
              <Text variant="body" tone="muted" style={styles.identityWorkspace}>{activeWorkspaceName}</Text>
            </View>
            <ChevronRight size={metrics.headerIcon - 6} color={colors.textMuted} style={mirrorIcon(isRTL)} />
          </Pressable>
        </Animated.View>

        <View style={styles.businessNav}>
          <Pressable style={styles.navRow} onPress={() => navigateAfterClose("/(app)/organization")}>
            <Users size={metrics.navIcon} color={colors.textPrimary} />
            <Text variant="title" style={styles.navLabel}>{t.workspaceAccess.organizationSettingsTitle}</Text>
          </Pressable>
          <Pressable style={styles.navRow} onPress={() => navigateAfterClose("/(app)/notifications")}>
            <Bell size={metrics.navIcon} color={colors.textPrimary} />
            <Text variant="title" style={styles.navLabel}>{t.profile.notifications}</Text>
          </Pressable>
          <Pressable style={styles.navRow} onPress={onNavigateProfile}>
            <Settings size={metrics.navIcon} color={colors.textPrimary} />
            <Text variant="title" style={styles.navLabel}>{t.menu.userSettings}</Text>
          </Pressable>
        </View>

        <View style={styles.seriesSection}>
          <View style={styles.seriesHeader}>
            <Text variant="title" style={styles.seriesTitle}>Recent series</Text>
            <Pressable onPress={onOpenFullHistory} hitSlop={8}>
              <Text variant="label" tone="muted">See all</Text>
            </Pressable>
          </View>

          {threadHistory.isLoading ? (
            <ThreadSkeletonRows />
          ) : threadHistory.error ? (
            <Pressable style={styles.errorRow} onPress={threadHistory.refresh}>
              <AlertCircle size={metrics.seriesIcon} color={colors.danger} />
              <View style={styles.itemTextBlock}>
                <Text variant="body" style={styles.itemLabel}>{t.menu.loadConversationsError}</Text>
                <Text variant="caption" tone="muted" style={styles.itemSubLabel}>{t.menu.retry}</Text>
              </View>
              <RotateCcw size={metrics.seriesIcon - 4} color={colors.textMuted} style={mirrorIcon(isRTL)} />
            </Pressable>
          ) : null}

          {threadHistory.threads.map((thread) => {
            const item = presentThreadHistoryItem(thread, { untitledLabel: t.menu.untitledSearch });
            const isFavorite = favoriteThreadIds.includes(thread._id);
            return (
              <View key={thread._id} style={styles.seriesRow}>
                <Pressable
                  style={styles.seriesPress}
                  onPress={() => {
                    setActiveThreadId(thread._id);
                    onClose();
                  }}
                >
                  <Clock size={metrics.seriesIcon} color={colors.textPrimary} />
                  <Text variant="title" style={styles.seriesLabel} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <ChevronRight size={metrics.seriesIcon - 6} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                </Pressable>
                <Pressable
                  accessibilityLabel={t.common.save}
                  onPress={() => toggleFavoriteThread(thread._id)}
                  hitSlop={10}
                  style={styles.seriesStarButton}
                >
                  <Star
                    size={metrics.starIcon}
                    color={isFavorite ? colors.accent : colors.textMuted}
                    fill={isFavorite ? colors.accent : "transparent"}
                  />
                </Pressable>
              </View>
            );
          })}

          {threadHistory.hasMore ? (
            <Pressable
              testID="menu.full_history"
              style={styles.seriesRow}
              onPress={onOpenFullHistory}
            >
              <Clock size={metrics.seriesIcon} color={colors.textPrimary} />
              <Text variant="title" style={styles.seriesLabel}>{t.menu.fullHistory}</Text>
              <ChevronRight size={metrics.seriesIcon - 6} color={colors.textMuted} style={mirrorIcon(isRTL)} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        testID="chat.new_thread"
        style={[
          styles.floatingNewButton,
          {
            bottom: bottomInset + metrics.floatingBottom,
            backgroundColor: inverseBackground,
          },
        ]}
        onPress={handleNewThread}
      >
        <Plus size={metrics.floatingIcon} color={inverseForeground} />
        <Text variant="title" style={[styles.floatingNewLabel, { color: inverseForeground }]}>New series</Text>
      </Pressable>
    </View>
  );
}

function ThreadSkeletonRows() {
  const { colors } = useTheme();
  return (
    <View>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index}>
          <View style={skeletonStyles.row}>
            <View style={[skeletonStyles.icon, { backgroundColor: colors.surfaceRaised }]} />
            <View style={[skeletonStyles.line, { backgroundColor: colors.surfaceRaised }]} />
          </View>
          {index < 3 ? <View style={[skeletonStyles.divider, { backgroundColor: colors.divider }]} /> : null}
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean, metrics: MobileDrawerMetrics) => StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "flex-start",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  drawer: {
    flex: 1,
    backgroundColor: colors.background,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  contentRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: metrics.topBarBottom,
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: metrics.brandFont,
    lineHeight: metrics.brandLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
  },
  topActions: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: metrics.topActionGap,
  },
  headerIconButton: {
    width: metrics.headerIconButton,
    height: metrics.headerIconButton,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarButton: {
    width: metrics.avatar,
    height: metrics.avatar,
    borderRadius: metrics.avatar / 2,
    overflow: "hidden",
  },
  headerAvatar: {
    flex: 1,
    borderRadius: metrics.avatar / 2,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarImage: {
    width: metrics.avatar,
    height: metrics.avatar,
    borderRadius: metrics.avatar / 2,
  },
  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: metrics.avatarText,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
  },
  identityBlock: {
    marginBottom: metrics.identityBottom,
  },
  identityTap: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
  },
  identityMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  identityName: {
    color: colors.textPrimary,
    fontSize: metrics.identityNameFont,
    lineHeight: metrics.identityNameLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
  },
  identityWorkspace: {
    color: colors.textMuted,
    fontSize: metrics.identityWorkspaceFont,
    lineHeight: 22,
    marginTop: 2,
    textAlign: isRTL ? "right" : "left",
  },
  businessNav: {
    gap: metrics.businessGap,
    marginBottom: metrics.businessBottom,
  },
  navRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: metrics.navGap,
    minHeight: metrics.navLine + 6,
  },
  navLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: metrics.navFont,
    lineHeight: metrics.navLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: isRTL ? "right" : "left",
  },
  seriesSection: {
    gap: 4,
  },
  seriesHeader: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  seriesTitle: {
    color: colors.textPrimary,
    fontSize: metrics.seriesTitleFont,
    lineHeight: metrics.seriesTitleLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
  },
  errorRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
  },
  seriesRow: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    minHeight: metrics.seriesRowMin,
  },
  seriesPress: {
    flex: 1,
    minWidth: 0,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: metrics.seriesGap,
    paddingVertical: 12,
  },
  seriesLabel: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
    fontSize: metrics.seriesFont,
    lineHeight: metrics.seriesLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: isRTL ? "right" : "left",
  },
  seriesStarButton: {
    width: metrics.starButton,
    height: metrics.starButton,
    borderRadius: metrics.starButton / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingNewButton: {
    position: "absolute",
    right: 28,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: metrics.floatingGap,
    minHeight: metrics.floatingMinHeight,
    paddingHorizontal: metrics.floatingPaddingX,
    borderRadius: metrics.floatingRadius,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 12,
  },
  floatingNewLabel: {
    fontSize: metrics.floatingFont,
    lineHeight: metrics.floatingLine,
    fontFamily: "Manrope_700Bold",
    fontWeight: "800",
    letterSpacing: 0,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: isRTL ? "flex-start" : "flex-end",
    paddingHorizontal: 16,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  profile: {
    marginBottom: 24,
    marginTop: 0,
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
  errorIconBox: {
    backgroundColor: `${colors.danger}12`,
  },
  itemTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  itemLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  itemSubLabel: {
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
});

const skeletonStyles = StyleSheet.create({
  row: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  line: {
    flex: 1,
    height: 16,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
