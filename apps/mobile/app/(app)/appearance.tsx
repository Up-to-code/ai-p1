import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Monitor, MoonStar, SunMedium } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatWebCopy, useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppearanceMode } from "@/store/slices/preferenceSlice";

const OPTIONS: Array<{
  value: AppearanceMode;
  title: string;
  description: string;
  icon: "system" | "light" | "dark";
}> = [
  { value: "system", title: "System", description: "Follow your phone's current appearance automatically.", icon: "system" },
  { value: "light", title: "Light", description: "Bright surfaces and clear contrast for daytime browsing.", icon: "light" },
  { value: "dark", title: "Dark", description: "Low-glare surfaces for immersive browsing and night use.", icon: "dark" },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, appearanceMode, resolvedColorScheme, setAppearanceMode } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
        </Pressable>
        <View style={styles.headerText}>
          <Text variant="title" style={styles.headerTitle}>{t.appSettings.appearanceTitle}</Text>
          <Text variant="caption" tone="muted">
            {formatWebCopy(t.appSettings.appearanceSubtitle, { mode: resolvedColorScheme })}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="display" style={styles.heroTitle}>{t.appSettings.appearanceHeroTitle}</Text>
          <Text tone="secondary" style={styles.heroCopy}>{t.appSettings.appearanceHeroBody}</Text>
        </View>

        <View style={styles.optionGroup}>
          {OPTIONS.map((option) => {
            const selected = option.value === appearanceMode;
            return (
              <Pressable
                key={option.value}
                testID={`appearance.option.${option.value}`}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => setAppearanceMode(option.value)}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  <OptionIcon mode={option.icon} color={colors.textPrimary} />
                </View>
                <View style={styles.optionText}>
                  <Text variant="body" style={styles.optionTitle}>{option.title}</Text>
                  <Text variant="caption" tone="secondary">{option.description}</Text>
                </View>
                <View
                  testID={selected ? `appearance.selected.${option.value}` : undefined}
                  style={[styles.checkWrap, selected && styles.checkWrapSelected]}
                >
                  {selected ? <Check size={16} color={colors.background} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

function OptionIcon({ mode, color }: { mode: "system" | "light" | "dark"; color: string }) {
  if (mode === "system") {
    return <Monitor size={18} color={color} />;
  }

  if (mode === "light") {
    return <SunMedium size={18} color={color} />;
  }

  return <MoonStar size={18} color={color} />;
}

const createStyles = (colors: any, isRTL: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: `${colors.background}F2`,
    },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    headerText: {
      flex: 1,
      gap: 2,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Manrope_800ExtraBold",
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    hero: {
      gap: theme.spacing.sm,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    heroTitle: {
      fontSize: 30,
      fontFamily: "Manrope_800ExtraBold",
    },
    heroCopy: {
      lineHeight: 22,
    },
    optionGroup: {
      gap: theme.spacing.md,
    },
    optionCard: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: theme.spacing.md,
      backgroundColor: "transparent",
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: colors.divider,
      padding: theme.spacing.lg,
    },
    optionCardSelected: {
      borderColor: colors.textPrimary,
      borderWidth: 2,
      padding: theme.spacing.lg - 1,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    optionIconSelected: {
      borderColor: colors.textPrimary,
    },
    optionText: {
      flex: 1,
      gap: 2,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    optionTitle: {
      fontWeight: "800",
      fontFamily: "Manrope_800ExtraBold",
    },
    checkWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    checkWrapSelected: {
      backgroundColor: colors.textPrimary,
      borderColor: colors.textPrimary,
      justifyContent: "center",
      alignItems: "center",
    },
  });
