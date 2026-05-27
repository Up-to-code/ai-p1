import { Pressable, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Monitor, MoonStar, SunMedium } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppearanceMode } from "@/store/slices/preferenceSlice";

const OPTION_META: Array<{
  value: AppearanceMode;
  icon: "system" | "light" | "dark";
}> = [
  { value: "system", icon: "system" },
  { value: "light", icon: "light" },
  { value: "dark", icon: "dark" },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, appearanceMode, setAppearanceMode } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const options = [
    {
      ...OPTION_META[0],
      title: t.appSettings.appearanceSystemTitle,
      description: t.appSettings.appearanceSystemDescription,
    },
    {
      ...OPTION_META[1],
      title: t.appSettings.appearanceLightTitle,
      description: t.appSettings.appearanceLightDescription,
    },
    {
      ...OPTION_META[2],
      title: t.appSettings.appearanceDarkTitle,
      description: t.appSettings.appearanceDarkDescription,
    },
  ];

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
        <Text variant="title" style={styles.headerTitle}>{t.appSettings.appearanceTitle}</Text>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}>
        <View style={styles.optionGroup}>
          {options.map((option) => {
            const selected = option.value === appearanceMode;
            return (
              <Pressable
                key={option.value}
                testID={`appearance.option.${option.value}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.optionSegment, selected && styles.optionSegmentSelected]}
                onPress={() => setAppearanceMode(option.value)}
              >
                <OptionIcon mode={option.icon} color={selected ? colors.background : colors.textPrimary} />
                <Text
                  testID={selected ? `appearance.selected.${option.value}` : undefined}
                  style={[styles.optionTitle, selected && styles.optionTitleSelected]}
                >
                  {option.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
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
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.background,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: "Manrope_800ExtraBold",
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    optionGroup: {
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: theme.spacing.xs,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: colors.surface,
      padding: 4,
    },
    optionSegment: {
      flex: 1,
      minHeight: 44,
      borderRadius: 18,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.xs,
    },
    optionSegmentSelected: {
      backgroundColor: colors.textPrimary,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: 12,
      lineHeight: 16,
      fontFamily: "Manrope_800ExtraBold",
    },
    optionTitleSelected: {
      color: colors.background,
    },
  });
