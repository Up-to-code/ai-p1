import { ScrollView, StyleSheet, View, Pressable, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Settings,
  LogOut,
  Shield,
  ChevronRight,
  Bell,
  Heart,
  CreditCard,
  ArrowLeft,
  SunMoon,
  Languages,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { authClient, deleteAnonymousAccount } from "@/auth/authClient";
import { useAuthSession } from "@/auth/useAuthSession";
import { resetE2EAuthState } from "@/e2e/store";
import { useAppStore } from "@/store";
import { useAppLocalization } from "@/foundation/localization";
import { formatLanguagePreferenceLabel } from "@/foundation/localization/languageSettings";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL, localePreference } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const { user, isAuthenticated, isGuest } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const setGuestMode = useAppStore((state) => state.setGuestMode);
  const clearGuestMirror = useAppStore((state) => state.clearGuestMirror);
  const setComparePropertyIds = useAppStore((state) => state.setComparePropertyIds);
  const resetConversationState = useAppStore((state) => state.resetConversationState);
  const setSelectedPropertyId = useAppStore((state) => state.setSelectedPropertyId);

  const handleLogout = () => {
    Alert.alert(
      isGuest ? t.profile.resetSession : t.profile.signOut,
      "Are you sure you want to end your current session?",
      [
        { text: t.common.close || "Cancel", style: "cancel" },
        {
          text: isGuest ? t.profile.resetSession : t.profile.signOut,
          style: "destructive",
          onPress: () => {
            if (e2eQaMode) {
              resetE2EAuthState();
              router.replace("/(auth)");
              return;
            }
            if (isGuest) {
              void deleteAnonymousAccount().catch(() => authClient.signOut().catch(() => null));
              clearGuestMirror();
              setComparePropertyIds([]);
              setSelectedPropertyId(null);
              resetConversationState();
              setGuestMode(false);
              router.replace("/(auth)");
              return;
            }
            if (isAuthenticated) {
              void authClient.signOut();
            }
          },
        },
      ]
    );
  };

  const displayName = isGuest ? t.menu.anonymousSession : user?.name ?? user?.email ?? "Ahmed Mansour";
  const avatarUrl = !isGuest ? user?.image ?? null : null;
  const initials = displayName
    .split(" ")
    .map((part: string) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  const languageSummary = formatLanguagePreferenceLabel(t, localePreference);

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
      label: t.profile.account,
      items: [
        { id: "pref", label: t.profile.aiSearchStyle, icon: <Settings size={18} color={colors.accent} />, onPress: () => router.push("/(app)/ai-search-style" as never) },
        { id: "appearance", label: t.appSettings.appearanceTitle, icon: <SunMoon size={18} color={colors.textPrimary} />, onPress: () => router.push("/(app)/appearance" as never) },
        {
          id: "language",
          label: t.appSettings.languageTitle,
          description: languageSummary,
          icon: <Languages size={18} color={colors.textPrimary} />,
          onPress: () => router.push("/(app)/language" as never),
        },
      ],
    },
    {
      label: t.profile.security,
      items: [
        { id: "security", label: t.profile.loginSecurity, icon: <Shield size={18} color={colors.textPrimary} /> },
        { id: "privacy", label: t.profile.memoryPrivacy, icon: <Heart size={18} color={colors.textPrimary} /> },
      ],
    },
    {
      label: t.profile.services,
      items: [
        { id: "billing", label: t.profile.subscription, icon: <CreditCard size={18} color={colors.accent} /> },
        { id: "notif", label: t.profile.marketAlerts, icon: <Bell size={18} color={colors.textPrimary} /> },
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
                <Text style={styles.avatarText}>{initials || "Z"}</Text>
              </View>
            )}
          </View>
          <View style={styles.heroText}>
            <Text variant="display" style={styles.userName}>{displayName}</Text>
          </View>
        </Animated.View>

        {isGuest && (
          <View style={styles.authPrompt}>
            <Pressable style={styles.loginBtn} onPress={() => router.push("/(auth)")}>
              <Text style={styles.loginBtnText}>{t.profile.logInToSync}</Text>
              <ChevronRight size={16} color={colors.background} style={mirrorIcon(isRTL)} />
            </Pressable>
          </View>
        )}

        <View style={styles.menu}>
          {menuGroups.map((group) => (
            <View key={group.label} style={styles.groupWrapper}>
              <Text variant="caption" tone="muted" style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.groupCard}>
                {group.items.map((item, idx) => (
                  <View key={item.id}>
                    <Pressable style={styles.item} onPress={() => item.onPress?.()}>
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
            <Text style={styles.signOutText}>{isGuest ? t.profile.resetSession : t.profile.signOut}</Text>
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
    paddingHorizontal: 16,
  },
  hero: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
    marginTop: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -1,
    textAlign: "center",
    includeFontPadding: false,
  },
  heroText: {
    alignItems: isRTL ? "flex-end" : "flex-start",
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: isRTL ? "right" : "left",
  },
  authPrompt: {
    marginBottom: 40,
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    backgroundColor: colors.textPrimary,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  loginBtnText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 14,
  },
  menu: {
    gap: 24,
  },
  groupWrapper: {
    gap: 10,
  },
  groupCard: {
    backgroundColor: "transparent",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: "hidden",
  },
  groupLabel: {
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
  },
  item: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemMain: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  itemTextWrap: {
    flex: 1,
    alignItems: isRTL ? "flex-end" : "flex-start",
    gap: 2,
  },
  itemLabel: {
    textAlign: isRTL ? "right" : "left",
    fontFamily: "Manrope_800ExtraBold",
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
    marginTop: 28,
    marginBottom: 16,
    alignItems: "center",
  },
  signOutBtn: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  signOutText: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
