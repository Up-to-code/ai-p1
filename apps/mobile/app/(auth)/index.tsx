import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { authClient, isWorkspaceAuthConfigured } from "@/auth/authClient";
import { AppleIcon, GoogleIcon } from "@/foundation/components/BrandIcons";
import { TypewriterText } from "@/foundation/components/TypewriterText";
import { LogoMark } from "@/foundation/icons/LogoMark";
import { useAppLocalization } from "@/foundation/localization";
import { markAuthSessionActive } from "@/auth/signOut";
import {
  mobileSocialProviders,
  signInWithWorkspaceSocialProvider,
  type MobileSocialProvider,
} from "@/auth/socialAuth";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL, locale } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const landingPhrases = useMemo(() => t.auth.landingPhrases, [t.auth.landingPhrases]);
  const { canAccessApp, isReady } = useAuthSession();
  const signInInFlightRef = useRef(false);
  const [signingProvider, setSigningProvider] = useState<MobileSocialProvider | null>(null);

  if (isReady && canAccessApp) {
    return <Redirect href="/(app)" />;
  }

  const handleSocialSignIn = async (provider: MobileSocialProvider) => {
    if (signInInFlightRef.current) {
      return;
    }

    signInInFlightRef.current = true;
    setSigningProvider(provider);

    try {
      if (!isWorkspaceAuthConfigured()) {
        throw new Error(t.auth.signInUnavailableBody);
      }
      await signInWithWorkspaceSocialProvider(authClient, provider);
      markAuthSessionActive();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        t.auth.signInUnavailableTitle,
        error instanceof Error ? error.message : t.auth.signInUnavailableBody,
      );
    } finally {
      signInInFlightRef.current = false;
      setSigningProvider(null);
    }
  };

  const openLegalLink = async (path: "terms" | "privacy") => {
    const url = `https://app.qentrah.com/${path}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t.auth.signInUnavailableTitle, t.auth.signInUnavailableBody);
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
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <LogoMark size={42} color={colors.background} />
          </View>

          <Text variant="display" style={[styles.wordmark, { color: colors.textPrimary }]}>
            {t.auth.wordmark}
          </Text>

          <View style={styles.typewriterWrap}>
            <TypewriterText key={locale} phrases={landingPhrases} />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(220).springify()}
          style={styles.actionsWrap}
        >
          <View style={styles.buttonStack}>
            {mobileSocialProviders.map((provider, index) => {
              const isPrimary = index === 0;
              const isSigningIn = signingProvider !== null;
              return (
                <Button
                  key={provider}
                  testID={`auth.continue_${provider}`}
                  variant={isPrimary ? "primary" : "secondary"}
                  leading={
                    provider === "apple"
                      ? <AppleIcon size={18} color={isPrimary ? colors.background : colors.textPrimary} />
                      : <GoogleIcon size={20} />
                  }
                  label={provider === "apple" ? t.auth.continueWithApple : t.auth.continueWithGoogle}
                  disabled={isSigningIn}
                  onPress={() => void handleSocialSignIn(provider)}
                  style={[
                    isPrimary ? styles.primaryBtn : styles.secondaryBtn,
                    isSigningIn && styles.disabledBtn,
                    isPrimary
                      ? { backgroundColor: colors.textPrimary }
                      : { backgroundColor: colors.surface, borderColor: colors.divider },
                  ]}
                  textStyle={{ color: isPrimary ? colors.background : colors.textPrimary }}
                />
              );
            })}
          </View>

          <View style={styles.legalWrap}>
            <Text
              variant="caption"
              tone="muted"
              style={[styles.legalNotice, isRTL && styles.rtlText]}
            >
              {t.auth.legalNotice}
            </Text>

            <View style={[styles.legalLinks, isRTL && styles.rtlRow]}>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openLegalLink("terms")}
                hitSlop={8}
              >
                <Text variant="caption" tone="secondary" style={styles.legalLink}>
                  {t.auth.termsOfService}
                </Text>
              </Pressable>
              <Text variant="caption" tone="muted" style={styles.legalDot}>
                ·
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openLegalLink("privacy")}
                hitSlop={8}
              >
                <Text variant="caption" tone="secondary" style={styles.legalLink}>
                  {t.auth.privacyPolicy}
                </Text>
              </Pressable>
            </View>

            <Text variant="caption" tone="muted" style={styles.copyright}>
              {t.auth.copyright}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
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
    gap: 18,
    marginTop: 100,
  },
  logoBadge: {
    alignItems: "center",
    borderRadius: 22,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  wordmark: {
    fontSize: 42,
    letterSpacing: 0,
    lineHeight: 52,
    textAlign: "center",
    color: colors.textPrimary,
  },
  typewriterWrap: {
    minHeight: 58,
    justifyContent: "center",
    opacity: 0.7,
  },
  actionsWrap: {
    marginBottom: 40,
  },
  buttonStack: {
    gap: 12,
  },
  legalWrap: {
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  legalNotice: {
    textAlign: "center",
  },
  legalLinks: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  legalLink: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  legalDot: {
    color: colors.textMuted,
  },
  copyright: {
    textAlign: "center",
  },
  rtlText: {
    textAlign: "center",
    writingDirection: "rtl",
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
  disabledBtn: {
    opacity: 0.55,
  },
});
