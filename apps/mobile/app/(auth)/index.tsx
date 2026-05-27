import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { Mail } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { authClient } from "@/auth/authClient";
import { AppleIcon, GoogleIcon } from "@/foundation/components/BrandIcons";
import { TypewriterText } from "@/foundation/components/TypewriterText";
import { useAppLocalization } from "@/foundation/localization";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { canAccessApp, isReady } = useAuthSession();

  if (isReady && canAccessApp) {
    return <Redirect href="/(app)" />;
  }

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    try {
      const { error } = await (authClient as any).signIn.social({
        provider,
        callbackURL: "/auth-callback",
      });
      if (error) {
        throw new Error(error.message ?? `${provider} sign in is not configured for this environment.`);
      }
      await authClient.getSession();
      router.replace("/(app)");
    } catch (error) {
      Alert.alert(
        t.auth.signInUnavailableTitle,
        error instanceof Error ? error.message : t.auth.signInUnavailableBody,
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80, paddingBottom: Math.max(insets.bottom, 24) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(120).springify()} style={styles.heroWrap}>
          <Text variant="display" style={[styles.wordmark, { color: colors.textPrimary }]}>
            QENTRAH
          </Text>

          <View style={styles.typewriterWrap}>
            <TypewriterText
              phrases={[
                "Qentrah AI is ready.",
                "Your real estate history stays private.",
                "Sign in to continue.",
              ]}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(220).springify()}
          style={styles.actionsWrap}
        >
          <View style={styles.buttonStack}>
            <Button
              testID="auth.continue_apple"
              variant="primary"
              leading={<AppleIcon size={18} color={colors.background} />}
              label={t.auth.continueWithApple}
              onPress={() => void handleSocialSignIn("apple")}
              style={[styles.primaryBtn, { backgroundColor: colors.textPrimary }]}
              textStyle={{ color: colors.background }}
            />

            <Button
              testID="auth.continue_google"
              variant="secondary"
              leading={<GoogleIcon size={20} />}
              label={t.auth.continueWithGoogle}
              onPress={() => void handleSocialSignIn("google")}
              style={[
                styles.secondaryBtn,
                { backgroundColor: colors.surface, borderColor: colors.divider },
              ]}
              textStyle={{ color: colors.textPrimary }}
            />

            <Button
              testID="auth.continue_email"
              variant="secondary"
              leading={<Mail size={20} color={colors.textPrimary} />}
              label={t.auth.continueWithEmail}
              onPress={() => {
                router.push("/(auth)/email-options");
              }}
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
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxxl,
    justifyContent: "space-between",
  },
  heroWrap: {
    alignItems: "center",
    gap: 20,
    marginTop: 100,
  },
  wordmark: {
    fontSize: 42,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 2,
    lineHeight: 52,
    textAlign: "center",
    color: colors.textPrimary,
  },
  typewriterWrap: {
    minHeight: 40,
    justifyContent: "center",
    opacity: 0.7,
  },
  actionsWrap: {
    marginBottom: 40,
  },
  buttonStack: {
    gap: 12,
  },
  primaryBtn: {
    minHeight: 58,
    borderRadius: 29,
  },
  secondaryBtn: {
    minHeight: 58,
    borderRadius: 29,
    borderWidth: 1,
  },
});
