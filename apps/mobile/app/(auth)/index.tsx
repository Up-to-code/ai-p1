import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Redirect, useRouter, useSegments } from "expo-router";
import { Image } from "expo-image";
import { useMemo, useRef, useState } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Mail } from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAuthSession } from "@/auth/useAuthSession";
import { AuthGlassSurface } from "@/auth/components/AuthGlassSurface";
import { authClient, isWorkspaceAuthConfigured } from "@/auth/authClient";
import { AppleIcon, GoogleIcon } from "@/foundation/components/BrandIcons";
import { TypewriterText } from "@/foundation/components/TypewriterText";
import { useAppLocalization } from "@/foundation/localization";
import { markAuthSessionActive } from "@/auth/signOut";
import {
  signInWithWorkspaceSocialProvider,
  type MobileEmailVerificationChallenge,
  type MobileSocialProvider,
} from "@/auth/socialAuth";
import { useMobileAuthProviders } from "@/auth/useMobileAuthProviders";
import { EdgeFade } from "@/conversation/components/EdgeFade";
import { useSystemUI } from "@/foundation/system/useSystemUI";
import { authErrorMessage } from "@/auth/authErrors";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const systemUI = useSystemUI();
  const { t, isRTL, locale } = useAppLocalization();
  const isDark = resolvedColorScheme === "dark";
  const segments = useSegments();
  const styles = useMemo(() => createStyles(colors, isDark, systemUI.sizes.auth), [colors, isDark, systemUI.sizes.auth]);
  const landingPhrases = useMemo(() => t.auth.landingPhrases, [t.auth.landingPhrases]);
  const { canAccessApp, isReady } = useAuthSession();
  const authProviders = useMobileAuthProviders();
  const signInInFlightRef = useRef(false);
  const [signingProvider, setSigningProvider] = useState<MobileSocialProvider | null>(null);
  const activeSignInLabel = signingProvider ? t.auth.signingIn : null;
  const isFocusedAuthLanding = segments[0] === "(auth)" && segments[1] === undefined;

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
      const authError = error as Error & { emailVerification?: MobileEmailVerificationChallenge };
      if (authError.emailVerification) {
        router.replace({
          pathname: "/(auth)/login",
          params: {
            emailVerification: "1",
            email: authError.emailVerification.email,
            pendingAuthenticationToken: authError.emailVerification.pendingAuthenticationToken,
          },
        });
        return;
      }
      Alert.alert(
        t.auth.signInUnavailableTitle,
        authErrorMessage(error, t.auth.signInUnavailableBody),
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
      <View pointerEvents="none" style={[styles.topFade, { height: insets.top + 112 }]}>
        <EdgeFade color={colors.background} placement="top" startOpacity={1} midOpacity={0.25} />
      </View>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 18) + 14 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(90).duration(220)} style={styles.heroWrap}>
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel={t.auth.wordmark}
            contentFit="contain"
            source={require("../../assets/brand/qentrah-logo.svg")}
            style={[
              styles.brandLogo,
              { tintColor: isDark ? "#F5F7FB" : "#20242D" },
            ]}
          />
          <View style={styles.typewriterWrap}>
            <TypewriterText
              key={locale}
              active={isFocusedAuthLanding}
              hapticsEnabled={false}
              phrases={landingPhrases}
              color={colors.textSecondary}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(220).springify()}
          style={styles.actionsWrap}
        >
          <AuthGlassSurface style={styles.actionDock}>
            <View style={styles.buttonStack}>
              {authProviders.map(({ provider }) => {
                const isSigningIn = signingProvider !== null;
                const providerLabel = provider === "apple" ? t.auth.continueWithApple : t.auth.continueWithGoogle;
                const providerIcon = provider === "apple"
                  ? <AppleIcon size={20} color="#F5F7FB" />
                  : <GoogleIcon size={20} />;
                return (
                  <Button
                    key={provider}
                    testID={`auth.continue_${provider}`}
                    variant="secondary"
                    leading={providerIcon}
                    label={
                      signingProvider === provider
                        ? activeSignInLabel ?? t.auth.signingIn
                        : providerLabel
                    }
                    disabled={isSigningIn}
                    onPress={() => void handleSocialSignIn(provider)}
                    style={[
                      styles.secondaryBtn,
                      isSigningIn && styles.disabledBtn,
                      styles.themedAuthButton,
                    ]}
                    textStyle={styles.themedAuthButtonLabel}
                  />
                );
              })}
              <Button
                testID="auth.continue_email_password"
                variant="secondary"
                leading={<Mail size={19} color="#F5F7FB" />}
                label={t.auth.continueWithEmail}
                disabled={signingProvider !== null}
                onPress={() => router.push("/(auth)/login")}
                style={[
                  styles.secondaryBtn,
                  signingProvider !== null && styles.disabledBtn,
                  styles.themedAuthButton,
                ]}
                textStyle={styles.themedAuthButtonLabel}
              />
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
          </AuthGlassSurface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors, isDark: boolean, authSizes: ReturnType<typeof useSystemUI>["sizes"]["auth"]) => StyleSheet.create({
  container: {
    flex: 1,
  },
  topFade: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: authSizes.horizontalPadding,
    justifyContent: "space-between",
  },
  heroWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: authSizes.heroGap,
    paddingBottom: authSizes.heroGap,
    paddingTop: 18,
  },
  brandLogo: {
    height: 58,
    width: 58,
  },
  typewriterWrap: {
    alignItems: "center",
    minHeight: 84,
    justifyContent: "center",
    opacity: 0.86,
    paddingHorizontal: theme.spacing.md,
    width: "100%",
  },
  actionsWrap: {
    marginBottom: 0,
  },
  actionDock: {
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    width: "100%",
  },
  buttonStack: {
    gap: 12,
  },
  legalWrap: {
    alignItems: "center",
    gap: 6,
    marginTop: 20,
  },
  legalNotice: {
    maxWidth: authSizes.legalMaxWidth,
    textAlign: "center",
  },
  legalLinks: {
    alignItems: "center",
    flexWrap: "wrap",
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
  secondaryBtn: {
    minHeight: authSizes.buttonHeight,
    borderRadius: authSizes.buttonRadius,
    borderWidth: 1,
  },
  themedAuthButton: {
    backgroundColor: isDark ? "#0E1218" : "#171C24",
    borderColor: "transparent",
    paddingHorizontal: authSizes.buttonHorizontalPadding,
  },
  themedAuthButtonLabel: {
    color: "#F5F7FB",
    fontSize: authSizes.buttonFontSize,
    lineHeight: authSizes.buttonLineHeight,
  },
  disabledBtn: {
    opacity: 0.55,
  },
});
