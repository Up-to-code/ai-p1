import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { X, DollarSign, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store";
import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

const BUDGET_OPTIONS = [
  { label: "1.5M - 3M", value: [1500000, 3000000] },
  { label: "3M - 5M", value: [3000000, 5000000] },
  { label: "5M - 10M", value: [5000000, 10000000] },
  { label: "10M - 20M", value: [10000000, 20000000] },
  { label: "20M+", value: [20000000, 50000000] },
];

const ONBOARDING_MOTION = {
  introDelayMs: 80,
  contentDelayMs: 140,
  actionsDelayMs: 220,
  damping: 20,
  stiffness: 240,
};

export default function OnboardingBudgetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();

  const setOnboardingComplete = useAppStore((state) => state.setOnboardingComplete);
  const preferenceProfile = useAppStore((state) => state.preferenceProfile);
  const patchPreferenceProfile = useAppStore((state) => state.patchPreferenceProfile);

  const selectedBudget = preferenceProfile.budgetRange;

  const selectBudget = (range: number[]) => {
    patchPreferenceProfile({ budgetRange: [range[0] ?? 0, range[1] ?? Number.MAX_SAFE_INTEGER] });
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    router.replace("/(app)");
  };

  const handleNext = () => {
    router.push("/(onboarding)/types");
  };

  const styles = StyleSheet.create({
    container: {
      padding: 0,
      backgroundColor: colors.background,
    },
    topSection: {
      flexDirection: isRTL ? "row-reverse" : "row",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.xl,
      zIndex: 10,
    },
    navBtn: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.divider,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingVertical: 40,
      gap: 32,
    },
    intro: {
      gap: 12,
      alignItems: isRTL ? "flex-end" : "flex-start",
    },
    display: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      textAlign: isRTL ? "right" : "left",
    },
    optionsStack: {
      gap: 12,
    },
    optionCard: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 18,
      borderRadius: 16,
      borderWidth: 1,
    },
    optionText: {
      fontSize: 16,
      fontWeight: "600",
    },
    actions: {
      paddingHorizontal: 24,
      gap: 16,
    },
    mainBtn: {
      height: 64,
      backgroundColor: colors.textPrimary,
    },
  });

  return (
    <Screen style={styles.container}>
      <View style={[styles.topSection, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable style={styles.navBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
        </Pressable>
        <Pressable style={styles.navBtn} onPress={handleSkip}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInUp.delay(ONBOARDING_MOTION.introDelayMs)
              .springify()
              .damping(ONBOARDING_MOTION.damping)
              .stiffness(ONBOARDING_MOTION.stiffness)}
            style={styles.intro}
          >
            <Text variant="display" style={styles.display}>{t.onboarding.budgetTitle}</Text>
            <Text style={styles.subtitle}>
              {t.onboarding.budgetBody}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(ONBOARDING_MOTION.contentDelayMs)
              .springify()
              .damping(ONBOARDING_MOTION.damping)
              .stiffness(ONBOARDING_MOTION.stiffness)}
            style={styles.optionsStack}
          >
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = selectedBudget[0] === opt.value[0] && selectedBudget[1] === opt.value[1];
              return (
                <Pressable
                  key={opt.label}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isSelected ? colors.textPrimary : colors.surface,
                      borderColor: isSelected ? colors.textPrimary : colors.divider,
                    },
                  ]}
                  onPress={() => selectBudget(opt.value)}
                >
                  <DollarSign size={20} color={isSelected ? colors.background : colors.textPrimary} />
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? colors.background : colors.textPrimary },
                    ]}
                  >
                    {opt.label} {t.onboarding.currency}
                  </Text>
                </Pressable>
              );
            })}
          </Animated.View>
        </ScrollView>
      </View>

      <Animated.View
        entering={FadeInDown.delay(ONBOARDING_MOTION.actionsDelayMs)
          .springify()
          .damping(ONBOARDING_MOTION.damping)
          .stiffness(ONBOARDING_MOTION.stiffness)}
        style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 32) }]}
      >
        <Button
          label={t.common.continue}
          variant="primary"
          onPress={handleNext}
          style={styles.mainBtn}
          textStyle={{ color: colors.background }}
          disabled={!selectedBudget || selectedBudget.length < 2}
        />
      </Animated.View>
    </Screen>
  );
}
