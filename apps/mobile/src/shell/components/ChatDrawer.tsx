import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { AlertCircle, ChevronRight, Clock, Plus, RotateCcw, Settings, Star, X } from "lucide-react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";

import { useAuthSession } from "@/auth/useAuthSession";
import { userAvatarPresentation } from "@/auth/userPresentation";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { workspaceOrganizationLabel } from "@/auth/workspaceAccess";
import { presentThreadHistoryItem } from "@/conversation/lib/threadHistoryPresentation";
import { createE2EThread } from "@/e2e/store";
import { useAppLocalization } from "@/foundation/localization";
import { Text } from "@/foundation/primitives/Text";
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
  const { isRTL } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const slideIn = isRTL ? SlideInLeft : SlideInRight;
  const slideOut = isRTL ? SlideOutLeft : SlideOutRight;

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
          entering={slideIn.duration(190)}
          exiting={slideOut.duration(150)}
          style={[
            styles.drawer,
            {
              width,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
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
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
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

  const handleNewThread = () => {
    beginThreadCreation();
    if (e2eQaMode) {
      setActiveThreadId(createE2EThread());
    } else {
      setActiveThreadId(null);
    }
    onClose();
  };

  return (
    <View style={styles.contentRoot}>
      {showClose ? (
        <View style={[styles.header, { paddingTop: topInset + 10 }]}>
          <Pressable
            testID="menu.close"
            accessibilityLabel={t.common.close}
            onPress={onClose}
            style={styles.closeBtn}
          >
            <X size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topInset + (showClose ? 72 : 24),
            paddingBottom: bottomInset + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.springify()} style={styles.profile}>
          <Pressable testID="menu.profile" style={styles.profileTap} onPress={onNavigateProfile}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "Q"}</Text>
              </View>
            )}
            <View style={styles.profileMeta}>
              <Text variant="title" style={styles.profileName}>{displayName}</Text>
              <Text variant="caption" tone="muted">{activeWorkspaceName}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} style={mirrorIcon(isRTL)} />
          </Pressable>
        </Animated.View>

        <View style={styles.menuGroups}>
          <View style={styles.groupWrapper}>
            <Text variant="caption" tone="muted" style={styles.groupLabel}>{t.menu.researchArchive}</Text>
            <View style={styles.groupCard}>
              <Pressable testID="chat.new_thread" style={styles.listItem} onPress={handleNewThread}>
                <View style={styles.itemIconBox}>
                  <Plus size={18} color={colors.accent} />
                </View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.startConversation}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>

              <View style={styles.divider} />

              {threadHistory.isLoading ? (
                <ThreadSkeletonRows />
              ) : threadHistory.error ? (
                <Pressable style={styles.listItem} onPress={threadHistory.refresh}>
                  <View style={[styles.itemIconBox, styles.errorIconBox]}>
                    <AlertCircle size={18} color={colors.danger} />
                  </View>
                  <View style={styles.itemTextBlock}>
                    <Text variant="body" style={styles.itemLabel}>{t.menu.loadConversationsError}</Text>
                    <Text variant="caption" tone="muted" style={styles.itemSubLabel}>{t.menu.retry}</Text>
                  </View>
                  <RotateCcw size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                </Pressable>
              ) : null}

              {threadHistory.threads.map((thread, idx) => {
                const item = presentThreadHistoryItem(thread, { untitledLabel: t.menu.untitledSearch });
                const isFavorite = favoriteThreadIds.includes(thread._id);
                return (
                  <View key={thread._id}>
                    <View style={styles.threadRow}>
                      <Pressable
                        style={styles.threadPress}
                        onPress={() => {
                          setActiveThreadId(thread._id);
                          onClose();
                        }}
                      >
                        <View style={styles.itemIconBox}>
                          <Clock size={18} color={colors.textPrimary} />
                        </View>
                        <Text variant="body" style={styles.itemLabel} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                      </Pressable>
                      <Pressable
                        accessibilityLabel={t.common.save}
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
                    {idx < threadHistory.threads.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}

              {threadHistory.hasMore ? (
                <>
                  <View style={styles.divider} />
                  <Pressable
                    testID="menu.full_history"
                    style={styles.listItem}
                    onPress={onOpenFullHistory}
                  >
                    <View style={styles.itemIconBox}>
                      <Clock size={18} color={colors.textPrimary} />
                    </View>
                    <Text variant="body" style={styles.itemLabel}>{t.menu.fullHistory}</Text>
                    <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                  </Pressable>
                </>
              ) : null}
            </View>
          </View>

          <View style={styles.groupWrapper}>
            <Text variant="caption" tone="muted" style={styles.groupLabel}>{t.menu.workspaceTools}</Text>
            <View style={styles.groupCard}>
              <Pressable testID="menu.settings" style={styles.listItem} onPress={onNavigateProfile}>
                <View style={styles.itemIconBox}><Settings size={18} color={colors.textPrimary} /></View>
                <Text variant="body" style={styles.itemLabel}>{t.menu.userSettings}</Text>
                <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
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

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  drawer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentRoot: {
    flex: 1,
    backgroundColor: colors.background,
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
