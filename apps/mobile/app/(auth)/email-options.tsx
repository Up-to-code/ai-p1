import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { ArrowLeft, User, LogIn } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function EmailOptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();

  return (
    <Screen safe={false}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { top: insets.top + 10, flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Pressable
            accessibilityLabel={t.common.back}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={24} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t.auth.emailOptionsTitle}
          </Text>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 100, paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(120).springify()} style={styles.heroWrap}>
            <Text variant="display" style={[styles.display, { color: colors.textPrimary }]}>
              {t.auth.emailOptionsHeroTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t.auth.emailOptionsHeroBody}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.actionsWrap}>
            <View style={styles.buttonStack}>
              <Button
                testID="auth.login"
                label={t.auth.logIn}
                leading={<LogIn size={20} color={colors.background} />}
                variant="primary"
                onPress={() => router.push("/(auth)/login")}
                style={[styles.mainBtn, { backgroundColor: colors.textPrimary }]}
                textStyle={{ color: colors.background }}
              />

              <Button
                testID="auth.signup"
                label={t.auth.createAccount}
                leading={<User size={20} color={colors.textPrimary} />}
                variant="secondary"
                onPress={() => router.push("/(auth)/register")}
                style={[
                  styles.secondaryBtn,
                  { backgroundColor: colors.surface, borderColor: colors.divider },
                ]}
                textStyle={{ color: colors.textPrimary }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 100,
    alignItems: "center",
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerTitle: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxxl,
    justifyContent: "space-between",
  },
  heroWrap: {
    alignItems: "center",
    gap: 16,
    marginTop: 60,
  },
  display: {
    fontSize: 40,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 280,
  },
  actionsWrap: {
    marginBottom: 40,
  },
  buttonStack: {
    gap: 12,
  },
  mainBtn: {
    minHeight: 58,
    borderRadius: 29,
  },
  secondaryBtn: {
    minHeight: 58,
    borderRadius: 29,
    borderWidth: 1,
  },
});
