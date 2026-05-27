import { ScrollView, StyleSheet, View, Pressable, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import * as Clipboard from "expo-clipboard";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronRight,
  Languages,
  Link,
  LogOut,
  SunMoon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { signOutForAccountSwitch } from "@/auth/signOut";
import { useAppLocalization } from "@/foundation/localization";
import { formatLanguagePreferenceLabel } from "@/foundation/localization/languageSettings";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL, locale, localePreference } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const { user } = useAuthSession();
  const workspace = useWorkspaceAccess();

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

  const displayName = user?.name ?? user?.email ?? "Qentrah user";
  const avatarUrl = user?.image ?? null;
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  const languageSummary = formatLanguagePreferenceLabel(t, localePreference);
  const activeWorkspaceName = workspace.activeOrganization?.name
    ?? workspace.activeOrganization?.slug
    ?? t.workspaceAccess.untitledWorkspace;

  const handleCreateInviteLink = async () => {
    if (!workspace.organizationId) {
      router.push("/(auth)/choose-workspace" as never);
      return;
    }

    try {
      const invite = await workspace.createInviteLink({
        organizationId: workspace.organizationId,
        role: "member",
        locale,
      });
      if (invite.inviteUrl) {
        await Clipboard.setStringAsync(invite.inviteUrl);
      }
      Alert.alert(t.workspaceAccess.inviteLinkCreated, t.workspaceAccess.inviteLinkCopied);
    } catch (error) {
      Alert.alert(
        t.workspaceAccess.errorTitle,
        error instanceof Error ? error.message : t.workspaceAccess.errorBody,
      );
    }
  };

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
          label: t.workspaceAccess.activeWorkspace,
          description: activeWorkspaceName,
          icon: <BriefcaseBusiness size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(auth)/choose-workspace" as never),
        },
        {
          id: "switch_workspace",
          label: t.workspaceAccess.switchWorkspace,
          icon: <ChevronRight size={18} color={colors.textPrimary} style={mirrorIcon(isRTL)} />,
          onPress: () => router.push("/(auth)/choose-workspace" as never),
        },
        {
          id: "create_invite_link",
          label: t.workspaceAccess.createInviteLink,
          icon: <Link size={18} color={colors.textPrimary} />,
          onPress: () => void handleCreateInviteLink(),
        },
      ],
    },
    {
      label: t.profile.account,
      items: [
        {
          id: "language",
          label: t.appSettings.languageTitle,
          description: languageSummary,
          icon: <Languages size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/language" as never),
        },
        {
          id: "appearance",
          label: t.appSettings.appearanceTitle,
          icon: <SunMoon size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/appearance" as never),
        },
      ],
    },
  ];

  return (
    <Screen safe={false}>
      <View style={[styles.header, { top: insets.top + 10 }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
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
          <View style={styles.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "Q"}</Text>
              </View>
            )}
          </View>
          <View style={styles.heroText}>
            <Text variant="display" style={styles.userName}>{displayName}</Text>
            <Text variant="caption" tone="muted">Qentrah AI</Text>
          </View>
        </Animated.View>

        <View style={styles.menu}>
          {menuGroups.map((group) => (
            <View key={group.label} style={styles.groupWrapper}>
              <Text variant="caption" tone="muted" style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, idx) => (
                  <View key={item.id}>
                    <Pressable testID={`profile.${item.id}`} style={styles.item} onPress={() => item.onPress?.()}>
                      <View style={styles.itemMain}>
                        <View style={styles.itemIconBox}>
                          {item.icon}
                        </View>
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

        <View style={styles.footer}>
          <Pressable style={styles.signOutBtn} onPress={handleLogout}>
            <LogOut size={18} color={colors.textPrimary} />
            <Text style={styles.signOutText}>{t.profile.signOut}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    ...(isRTL ? { right: 20 } : { left: 20 }),
    zIndex: 100,
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarWrap: {
    marginBottom: 20,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarText: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "800",
  },
  heroText: {
    alignItems: "center",
    gap: 4,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
    textAlign: "center",
  },
  menu: {
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  item: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  itemMain: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  itemIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextWrap: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  itemLabel: {
    color: colors.textPrimary,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  itemDescription: {
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 34,
    alignItems: "center",
  },
  signOutBtn: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  signOutText: {
    color: colors.textPrimary,
    fontWeight: "800",
  },
});
