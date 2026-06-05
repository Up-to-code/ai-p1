import { ScrollView, StyleSheet, View, Pressable, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Languages,
  LogOut,
  RefreshCw,
  Monitor,
  MoonStar,
  SunMedium,
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
import type { AppearanceMode } from "@/store/slices/preferenceSlice";

const APPEARANCE_OPTIONS: Array<{ value: AppearanceMode; icon: "system" | "light" | "dark" }> = [
  { value: "system", icon: "system" },
  { value: "light", icon: "light" },
  { value: "dark", icon: "dark" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, appearanceMode, setAppearanceMode } = useTheme();
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
  const activeWorkspaceName = workspaceOrganizationLabel(
    workspace.activeOrganization,
    t.workspaceAccess.untitledWorkspace,
  );
  const appearanceOptions = APPEARANCE_OPTIONS.map((option) => ({
    ...option,
    title: option.value === "system"
      ? t.appSettings.appearanceSystemTitle
      : option.value === "light"
        ? t.appSettings.appearanceLightTitle
        : t.appSettings.appearanceDarkTitle,
  }));

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
          icon: <BriefcaseBusiness size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/organization" as never),
        },
        {
          id: "switch_workspace",
          label: t.workspaceAccess.switchWorkspace,
          icon: <RefreshCw size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(auth)/choose-workspace" as never),
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
      ],
    },
  ];

  return (
    <Screen safe={false}>
      <View style={[styles.header, { top: insets.top + 6 }]}>
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
            <Text variant="caption" style={styles.workspaceName}>{activeWorkspaceName}</Text>
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

          <View style={styles.groupWrapper}>
            <Text variant="caption" tone="muted" style={styles.groupLabel}>{t.appSettings.appearanceTitle}</Text>
            <View style={styles.modeGroup}>
              {appearanceOptions.map((option) => {
                const selected = option.value === appearanceMode;
                return (
                  <Pressable
                    key={option.value}
                    testID={`profile.appearance.${option.value}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.modeButton, selected && styles.modeButtonSelected]}
                    onPress={() => setAppearanceMode(option.value)}
                  >
                    <AppearanceIcon mode={option.icon} color={selected ? colors.background : colors.textPrimary} />
                    <Text style={[styles.modeText, selected && styles.modeTextSelected]} numberOfLines={1}>
                      {option.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
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

function AppearanceIcon({ mode, color }: { mode: "system" | "light" | "dark"; color: string }) {
  if (mode === "system") {
    return <Monitor size={17} color={color} />;
  }

  if (mode === "light") {
    return <SunMedium size={17} color={color} />;
  }

  return <MoonStar size={17} color={color} />;
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    ...(isRTL ? { right: 20 } : { left: 20 }),
    zIndex: 100,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
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
  workspaceName: {
    color: colors.textSecondary,
    fontWeight: "800",
    textAlign: "center",
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
  modeGroup: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  modeButtonSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  modeText: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  modeTextSelected: {
    color: colors.background,
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
    minHeight: 42,
    borderRadius: 21,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  signOutText: {
    color: colors.textPrimary,
    fontWeight: "800",
  },
});
