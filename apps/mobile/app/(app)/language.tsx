import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { buildLanguageOptions } from "@/foundation/localization/languageSettings";
import { theme, type AppColors } from "@/foundation/theme/tokens";
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
        <Text variant="title" style={styles.headerTitle}>{t.appSettings.languageTitle}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionList}>
          {options.map((option) => {
            const selected = option.value === localePreference;
            return (
              <Pressable
                key={option.value}
                testID={`language.option.${option.value}`}
                style={[styles.optionRow, selected && styles.optionRowSelected]}
                onPress={() => setLocalePreference(option.value)}
              >
                <View style={styles.optionText}>
                  <Text variant="body" style={styles.optionTitle}>
                    {option.title}
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

const createStyles = (colors: AppColors, isRTL: boolean) =>
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
      fontSize: 18,
      fontFamily: "Manrope_800ExtraBold",
      textAlign: isRTL ? "right" : "left",
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    optionList: {
      gap: 8,
    },
    optionRow: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      backgroundColor: "transparent",
      minHeight: 64,
      paddingVertical: theme.spacing.md,
    },
    optionRowSelected: {
      opacity: 1,
    },
    optionText: {
      flex: 1,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    optionTitle: {
      fontWeight: "800",
      fontFamily: "Manrope_800ExtraBold",
      fontSize: 21,
      lineHeight: 28,
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
