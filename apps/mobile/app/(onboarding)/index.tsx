import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { X, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "@/store";
import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppLocalization } from "@/foundation/localization";

const LOCATIONS = [
  "New Cairo",
  "Sheikh Zayed",
  "North Coast",
  "New Capital",
  "6th of October",
  "Maadi",
  "Shorouk",
];

const ONBOARDING_MOTION = {
  introDelayMs: 80,
  contentDelayMs: 140,
  actionsDelayMs: 220,
  damping: 20,
  stiffness: 240,
};

export default function OnboardingLocationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();

  const setOnboardingComplete = useAppStore((state) => state.setOnboardingComplete);
  const preferenceProfile = useAppStore((state) => state.preferenceProfile);
  const patchPreferenceProfile = useAppStore((state) => state.patchPreferenceProfile);

  const selectedLocations = preferenceProfile.locations;

  const toggleLocation = (location: string) => {
    let newLocations;
    if (selectedLocations.includes(location)) {
      newLocations = selectedLocations.filter((item) => item !== location);
    } else {
      newLocations = [...selectedLocations, location];
    }
    patchPreferenceProfile({ locations: newLocations });
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    router.replace("/(app)");
  };

  const handleNext = () => {
    router.push("/(onboarding)/budget");
  };

  const styles = StyleSheet.create({
    container: {
      padding: 0,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    topSection: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: theme.spacing.xl,
      zIndex: 10,
    },
    skipBtn: {
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
    chipGrid: {
      flexDirection: isRTL ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: 12,
    },
    chip: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 100,
      borderWidth: 1,
    },
    chipText: {
      fontSize: 15,
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
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
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
            <Text variant="display" style={styles.display}>{t.onboarding.locationsTitle}</Text>
            <Text style={styles.subtitle}>
              {t.onboarding.locationsBody}
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(ONBOARDING_MOTION.contentDelayMs)
              .springify()
              .damping(ONBOARDING_MOTION.damping)
              .stiffness(ONBOARDING_MOTION.stiffness)}
            style={styles.chipGrid}
          >
            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocations.includes(loc);
              return (
                <Pressable
                  key={loc}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.textPrimary : colors.surface,
                      borderColor: isSelected ? colors.textPrimary : colors.divider,
                    },
                  ]}
                  onPress={() => toggleLocation(loc)}
                >
                  <MapPin size={16} color={isSelected ? colors.background : colors.textPrimary} />
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? colors.background : colors.textPrimary },
                    ]}
                  >
                    {loc}
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
          disabled={selectedLocations.length === 0}
        />
      </Animated.View>
    </Screen>
  );
}
