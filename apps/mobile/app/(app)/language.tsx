import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, ChevronRight, Languages, Smartphone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { buildLanguageOptions } from "@/foundation/localization/languageSettings";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, localePreference, setLocalePreference, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const options = useMemo(() => buildLanguageOptions(t), [t]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <Screen style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
        <View style={styles.headerText}>
          <Text variant="title" style={styles.headerTitle}>{t.appSettings.languageTitle}</Text>
          <Text variant="caption" tone="muted">{t.appSettings.languageSubtitle}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="display" style={styles.heroTitle}>{t.appSettings.languageHeroTitle}</Text>
          <Text tone="secondary" style={styles.heroCopy}>
            {t.appSettings.languageHeroBody}
          </Text>
        </View>

        <View style={styles.optionGroup}>
          {options.map((option) => {
            const selected = option.value === localePreference;
            return (
              <Pressable
                key={option.value}
                testID={`language.option.${option.value}`}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => setLocalePreference(option.value)}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  {option.icon === "system" ? (
                    <Smartphone size={18} color={colors.textPrimary} />
                  ) : (
                    <Languages size={18} color={colors.textPrimary} />
                  )}
                </View>
                <View style={styles.optionText}>
                  <Text variant="body" style={styles.optionTitle}>
                    {option.title}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {option.description}
                  </Text>
                </View>
                <View style={[styles.checkWrap, selected && styles.checkWrapSelected]}>
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
