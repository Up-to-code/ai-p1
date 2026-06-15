import { ScrollView, StyleSheet, View, Pressable, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  BriefcaseBusiness,
  Bell,
  ChevronLeft,
  ChevronRight,
  Languages,
  LogOut,
  Monitor,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppColors } from "@/foundation/theme/tokens";
import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { signOutForAccountSwitch } from "@/auth/signOut";
import { useAppLocalization } from "@/foundation/localization";
import { formatLanguagePreferenceLabel } from "@/foundation/localization/languageSettings";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { workspaceOrganizationLabel } from "@/auth/workspaceAccess";
import { userAvatarPresentation } from "@/auth/userPresentation";
import { useOrganizationProfile } from "@/persistence/api/conversationData";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL, localePreference } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const { user } = useAuthSession();
  const workspace = useWorkspaceAccess();
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  const handleLogout = () => {
    Alert.alert(
      t.profile.signOut,
      "Are you sure you want to sign out of Qentrah?",
      [
        { text: t.common.close || "Cancel", style: "cancel" },
        {
          text: t.profile.signOut,
          style: "destructive",
          onPress: () => {
            void signOutForAccountSwitch();
            router.replace("/(auth)");
          },
        },
      ],
    );
  };

  const { displayName, avatarUrl, initials } = userAvatarPresentation(user);
  const languageSummary = formatLanguagePreferenceLabel(t, localePreference);
  const orgProfile = useOrganizationProfile();
  const activeWorkspaceName = orgProfile?.name?.trim()
    || workspaceOrganizationLabel(
      workspace.activeOrganization,
      t.workspaceAccess.untitledWorkspace,
    );
  const menuGroups: {
    label: string;
    items: {
      id: string;
      label: string;
      icon: React.ReactNode;
      description?: string;
      onPress?: () => void;
    }[];
  }[] = [
    {
      label: t.workspaceAccess.organizationSettingsTitle,
      items: [
        {
          id: "active_workspace",
          label: t.workspaceAccess.organizationSettingsTitle,
          description: activeWorkspaceName,
          icon: <BriefcaseBusiness size={21} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/organization" as never),
        },
      ],
    },
    {
      label: t.profile.account,
      items: [
        {
          id: "notifications",
          label: t.profile.notifications,
          description: t.profile.notificationsDescription,
          icon: <Bell size={21} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/notifications" as never),
        },
        {
          id: "language",
          label: t.appSettings.languageTitle,
          description: languageSummary,
          icon: <Languages size={21} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/language" as never),
        },
        {
          id: "appearance",
          label: t.appSettings.appearanceTitle,
          description: t.appSettings.appearanceSystemTitle,
          icon: <Monitor size={21} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/appearance" as never),
        },
      ],
    },
  ];

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 64, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.springify()} style={styles.hero}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "Q"}</Text>
            </View>
          )}
          <View style={styles.heroText}>
            <Text variant="display" style={styles.userName}>{displayName}</Text>
            <Text variant="caption" style={styles.workspaceName}>{activeWorkspaceName}</Text>
          </View>
        </Animated.View>

        <View style={styles.menu}>
          {menuGroups.map((group) => (
            <View key={group.label} style={styles.groupWrapper}>
              <Text variant="caption" tone="muted" style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupList}>
                {group.items.map((item, idx) => (
                  <View key={item.id}>
                    <Pressable testID={`profile.${item.id}`} style={styles.item} onPress={() => item.onPress?.()}>
                      <View style={styles.itemMain}>
                        {item.icon}
                        <View style={styles.itemTextWrap}>
                          <Text variant="body" style={styles.itemLabel}>{item.label}</Text>
                          {item.description ? (
                            <Text variant="caption" tone="muted" style={styles.itemDescription}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                    </Pressable>
                    {idx < group.items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

        </View>

        <Pressable style={styles.signOutBtn} onPress={handleLogout}>
          <LogOut size={18} color={colors.textPrimary} />
          <Text style={styles.signOutText}>{t.profile.signOut}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: isRTL ? "flex-end" : "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  hero: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  heroText: {
    flex: 1,
    alignItems: isRTL ? "flex-end" : "flex-start",
    gap: 2,
  },
  workspaceName: {
    color: colors.textSecondary,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: isRTL ? "right" : "left",
  },
  menu: {
    gap: 22,
  },
  groupWrapper: {
    gap: 8,
  },
  groupLabel: {
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupList: {
    gap: 6,
  },
  item: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  itemMain: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  itemIconBox: {
    width: 34,
    height: 34,
    display: "none",
  },
  itemTextWrap: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  itemLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  signOutBtn: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 10,
    alignItems: "center",
    alignSelf: isRTL ? "flex-end" : "flex-start",
    minHeight: 44,
    marginTop: 26,
    paddingVertical: 10,
  },
  signOutText: {
    color: colors.textPrimary,
    fontWeight: "800",
  },
});
