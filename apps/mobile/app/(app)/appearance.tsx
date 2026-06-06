import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Monitor, MoonStar, SunMedium } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import type { AppearanceMode } from "@/store/slices/preferenceSlice";

const OPTIONS: { value: AppearanceMode; icon: "system" | "light" | "dark" }[] = [
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
  const options = OPTIONS.map((option) => ({
    ...option,
    title: option.value === "system"
      ? t.appSettings.appearanceSystemTitle
      : option.value === "light"
        ? t.appSettings.appearanceLightTitle
        : t.appSettings.appearanceDarkTitle,
  }));

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
        <Text variant="title" style={styles.headerTitle}>{t.appSettings.appearanceTitle}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 76, paddingBottom: insets.bottom + theme.spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const selected = option.value === appearanceMode;
          return (
            <Pressable
              key={option.value}
              testID={`appearance.option.${option.value}`}
              style={styles.optionRow}
              onPress={() => setAppearanceMode(option.value)}
            >
              <AppearanceIcon mode={option.icon} color={colors.textPrimary} />
              <Text variant="body" style={styles.optionTitle}>{option.title}</Text>
              {selected ? <Check size={18} color={colors.textPrimary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

function AppearanceIcon({ mode, color }: { mode: "system" | "light" | "dark"; color: string }) {
  if (mode === "system") return <Monitor size={21} color={color} />;
  if (mode === "light") return <SunMedium size={21} color={color} />;
  return <MoonStar size={21} color={color} />;
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 18,
    textAlign: isRTL ? "right" : "left",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  optionRow: {
    minHeight: 64,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: theme.spacing.md,
  },
  optionTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 18,
    lineHeight: 25,
    textAlign: isRTL ? "right" : "left",
  },
});
