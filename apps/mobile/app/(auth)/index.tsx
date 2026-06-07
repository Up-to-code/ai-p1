import { ActivityIndicator, Alert, AppState, Linking, Platform, Pressable, StyleSheet, useWindowDimensions, View, type AppStateStatus } from "react-native";
import { Redirect, useIsFocused, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSSO } from "@clerk/expo";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isWorkspaceAuthConfigured } from "@/auth/authClient";
import { AppleIcon, GoogleIcon } from "@/foundation/components/BrandIcons";
import { Text } from "@/foundation/primitives/Text";
import { Button } from "@/foundation/primitives/Button";
import { useAppLocalization } from "@/foundation/localization";
import { type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { markAuthSessionActive } from "@/auth/signOut";
import { sanitizeAuthCallback } from "@/auth/authNavigation";
import { useMobileAuthGate } from "@/auth/mobileAuthGate";
import {
  signInWithWorkspaceSocialProvider,
  type SocialAuthFlow,
} from "@/auth/socialAuth";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import {
  playSoftSelectionHaptic,
  playTypewriterLazyOutHaptic,
  playTypewriterSpeedInHaptic,
  playTypewriterTickHaptic,
  playTypewriterWaveHaptic,
} from "@/foundation/haptics/customHaptics";
import { EmailAuthSheet } from "@/auth/components/EmailAuthSheet";

type HeadlineMotionPhase = "typing" | "holding" | "deleting";

const TYPE_IN_DURATION_MS = 500;
const HOLD_DURATION_MS = 1000;
const DELETE_DURATION_MS = 500;

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function delayForStep(totalDuration: number, totalSteps: number, currentStep: number, nextStep: number) {
  if (totalSteps <= 1) return totalDuration;
  const currentProgress = Math.max(0, Math.min(1, currentStep / totalSteps));
  const nextProgress = Math.max(0, Math.min(1, nextStep / totalSteps));
  return Math.max(18, Math.round((easeInOutSine(nextProgress) - easeInOutSine(currentProgress)) * totalDuration));
}

function playHeadlineWordHaptic(phase: HeadlineMotionPhase, wordIndex: number, totalWords: number, enabled: boolean) {
  if (!enabled) return;
  const progress = totalWords <= 1 ? 1 : wordIndex / Math.max(totalWords - 1, 1);
  if (phase === "deleting" || progress > 0.72) {
    playTypewriterLazyOutHaptic();
    return;
  }
  if (progress < 0.28) {
    playTypewriterSpeedInHaptic();
    return;
  }
  playTypewriterTickHaptic();
}

function wordIndexAtCharacter(value: string, characterIndex: number) {
  const beforeCharacter = value.slice(0, Math.max(0, characterIndex));
  return beforeCharacter.trim().length === 0 ? 0 : beforeCharacter.trim().split(/\s+/).length;
}

function wordCount(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function isAlreadySignedInError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const record = error as { code?: unknown; message?: unknown };
  return [record.code, record.message]
    .filter((value): value is string => typeof value === "string")
    .some((value) => /already[_\s-]?signed[_\s-]?in/i.test(value));
}

function NativeAuthButton({
  colors,
  disabled,
  icon,
  label,
  loading,
  onPress,
  outline,
  primary,
  styles,
  testID,
}: {
  colors: AppColors;
  disabled?: boolean;
  icon?: ReactNode;
  label: string;
  loading?: boolean;
  onPress: () => void;
  outline?: boolean;
  primary?: boolean;
  styles: ReturnType<typeof createStyles>;
  testID: string;
}) {
  const spinnerColor = primary ? colors.background : colors.textPrimary;

  return (
    <Button
      testID={testID}
      variant={primary ? "primary" : "secondary"}
      leading={loading ? <ActivityIndicator color={spinnerColor} size="small" /> : icon}
      label={label}
      disabled={disabled || loading}
      onPress={() => {
        playSoftSelectionHaptic();
        onPress();
      }}
      style={[styles.button, primary ? styles.primaryButton : outline ? styles.outlineButton : styles.secondaryButton, (disabled || loading) && styles.disabled]}
      textStyle={primary ? styles.primaryButtonText : styles.secondaryButtonText}
    />
  );
}

function GoogleButton({ disabled, loading, onSignIn, styles, colors }: {
  colors: AppColors;
  disabled: boolean;
  loading: boolean;
  styles: ReturnType<typeof createStyles>;
  onSignIn: (flow: SocialAuthFlow) => void;
}) {
  const sso = useSSO();
  return (
    <NativeAuthButton
      colors={colors}
      disabled={disabled}
      icon={<GoogleIcon size={20} />}
      label={loading ? "Connecting..." : "Continue with Google"}
      loading={loading}
      onPress={() => onSignIn(sso)}
      styles={styles}
      testID="auth.continue_google"
    />
  );
}

function AppleButton({ disabled, loading, onSignIn, styles, colors }: {
  colors: AppColors;
  disabled: boolean;
  loading: boolean;
  styles: ReturnType<typeof createStyles>;
  onSignIn: (flow: SocialAuthFlow) => void;
}) {
  const sso = useSSO();
  if (Platform.OS !== "ios") return null;

  return (
    <NativeAuthButton
      colors={colors}
      disabled={disabled}
      icon={<AppleIcon size={18} color={colors.background} />}
      label={loading ? "Connecting..." : "Continue with Apple"}
      loading={loading}
      onPress={() => onSignIn(sso)}
      primary
      styles={styles}
      testID="auth.continue_apple"
    />
  );
}

export default function AuthScreen() {
  const router = useRouter();
  const screenFocused = useIsFocused();
  const params = useLocalSearchParams<{ callbackURL?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, resolvedColorScheme), [colors, resolvedColorScheme]);
  const gate = useMobileAuthGate();
  const postAuthRoute = sanitizeAuthCallback(params.callbackURL);
  const authConfigured = isWorkspaceAuthConfigured();
  const signInInFlightRef = useRef(false);
  const canPlayTypewriterHapticsRef = useRef(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [busyProvider, setBusyProvider] = useState<"apple" | "google" | null>(null);
  const [emailSheetMode, setEmailSheetMode] = useState<"login" | "signup" | null>(null);
  const [sessionHandoffPending, setSessionHandoffPending] = useState(false);
  const headlineWords = useMemo(() => ["AI for operations", "Shared team work", "Deals in motion", "Records to action"], []);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [headlinePhase, setHeadlinePhase] = useState<HeadlineMotionPhase>("typing");
  const [typedHeadline, setTypedHeadline] = useState("");
  const fullHeadline = headlineWords[headlineIndex] ?? headlineWords[0];
  const headlineMaxWidth = Math.floor(width * 0.8);
  const dotSize = Math.max(18, Math.min(25, Math.floor(width * 0.06)));
  const headlineTextWidth = Math.max(180, headlineMaxWidth - dotSize - 10);
  const headlineSize = Math.max(17, Math.min(26, Math.floor(headlineTextWidth / Math.max(fullHeadline.length * 0.55, 1))));
  const authBusy = busyProvider !== null || sessionHandoffPending || (gate.status !== "signed_out" && gate.status !== "loading");
  const postAuthDestination = postAuthRoute === "/" || postAuthRoute === "/(auth)"
    ? gate.destination
    : postAuthRoute;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    canPlayTypewriterHapticsRef.current = screenFocused && appState === "active" && emailSheetMode === null;
  }, [appState, emailSheetMode, screenFocused]);

  useEffect(() => {
    if (!sessionHandoffPending || !gate.isReady || !gate.isAuthenticated || !postAuthDestination) return;
    console.info(`[social-auth] session ready, routing to ${postAuthDestination}`);
    router.replace(postAuthDestination as never);
  }, [gate.isAuthenticated, gate.isReady, postAuthDestination, router, sessionHandoffPending]);

  useEffect(() => {
    const fullText = headlineWords[headlineIndex] ?? headlineWords[0];
    const characterCount = Math.max(fullText.length, 1);
    const words = fullText.trim().split(/\s+/).filter(Boolean);
    const totalWords = Math.max(words.length, 1);
    const delay = headlinePhase === "holding"
      ? HOLD_DURATION_MS
      : headlinePhase === "typing"
        ? delayForStep(TYPE_IN_DURATION_MS, characterCount, typedHeadline.length, typedHeadline.length + 1)
        : delayForStep(DELETE_DURATION_MS, characterCount, characterCount - typedHeadline.length, characterCount - typedHeadline.length + 1);
    const timer = setTimeout(() => {
      if (headlinePhase === "holding") {
        setHeadlinePhase("deleting");
        if (canPlayTypewriterHapticsRef.current) playTypewriterWaveHaptic();
        return;
      }

      if (headlinePhase === "deleting") {
        if (typedHeadline.length <= 0) {
          setHeadlinePhase("typing");
          setHeadlineIndex((current) => (current + 1) % headlineWords.length);
          return;
        }
        const previousText = fullText.slice(0, typedHeadline.length);
        const nextText = fullText.slice(0, typedHeadline.length - 1);
        const removedWord = wordCount(previousText) > wordCount(nextText);
        if (removedWord) {
          playHeadlineWordHaptic("deleting", wordIndexAtCharacter(fullText, typedHeadline.length - 1), totalWords, canPlayTypewriterHapticsRef.current);
        }
        setTypedHeadline(fullText.slice(0, typedHeadline.length - 1));
        return;
      }

      if (typedHeadline.length >= fullText.length) {
        setHeadlinePhase("holding");
        if (canPlayTypewriterHapticsRef.current) playTypewriterLazyOutHaptic();
        return;
      }

      const nextLength = typedHeadline.length + 1;
      const nextCharacter = fullText[typedHeadline.length] ?? "";
      const previousCharacter = typedHeadline[typedHeadline.length - 1] ?? " ";
      const startsWord = nextCharacter.trim().length > 0 && previousCharacter.trim().length === 0;
      if (startsWord) {
        playHeadlineWordHaptic("typing", wordIndexAtCharacter(fullText, typedHeadline.length), totalWords, canPlayTypewriterHapticsRef.current);
        if (canPlayTypewriterHapticsRef.current) playTypewriterWaveHaptic();
      }
      setTypedHeadline(fullText.slice(0, nextLength));
    }, delay);

    return () => clearTimeout(timer);
  }, [headlineIndex, headlinePhase, headlineWords, typedHeadline]);

  if (gate.status !== "signed_out") {
    if (gate.isReady && postAuthDestination) {
      return <Redirect href={postAuthDestination as never} />;
    }
    return <AppBootScreen />;
  }

  const ensureAuthConfigured = () => {
    if (authConfigured) return true;
    Alert.alert(t.auth.signInUnavailableTitle, t.auth.signInUnavailableBody);
    return false;
  };

  const openEmail = (mode: "login" | "signup") => {
    if (authBusy || !ensureAuthConfigured()) return;
    setEmailSheetMode(mode);
  };

  const handleSocialSignIn = async (flow: SocialAuthFlow, provider: "apple" | "google") => {
    if (signInInFlightRef.current || sessionHandoffPending || !ensureAuthConfigured()) return;
    signInInFlightRef.current = true;
    setSessionHandoffPending(false);
    setBusyProvider(provider);
    try {
      await signInWithWorkspaceSocialProvider(flow, provider);
      markAuthSessionActive();
      setSessionHandoffPending(true);
    } catch (error) {
      if (isAlreadySignedInError(error)) {
        markAuthSessionActive();
        setSessionHandoffPending(true);
        router.replace("/" as never);
        return;
      }
      Alert.alert(t.auth.signInUnavailableTitle, error instanceof Error ? error.message : t.auth.signInUnavailableBody);
    } finally {
      signInInFlightRef.current = false;
      setBusyProvider(null);
    }
  };

  const openLegalLink = async (path: "terms" | "privacy") => {
    try {
      await Linking.openURL(`https://app.qentrah.com/${path}`);
    } catch {
      Alert.alert(t.auth.signInUnavailableTitle, t.auth.signInUnavailableBody);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
      <Animated.View entering={FadeIn.duration(160)} style={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.headlineRow, { maxWidth: headlineMaxWidth }, isRTL && styles.rtlRow]}>
            <Text
              variant="display"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[styles.headline, { fontSize: headlineSize, lineHeight: headlineSize + 8, maxWidth: headlineTextWidth }, isRTL && styles.rtlText]}
            >
              {typedHeadline}
            </Text>
            <View style={[styles.typeDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
          </View>
        </View>

        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom + 18, 28) }]}>
          <AppleButton colors={colors} disabled={authBusy} loading={busyProvider === "apple"} styles={styles} onSignIn={(flow) => void handleSocialSignIn(flow, "apple")} />
          <GoogleButton colors={colors} disabled={authBusy} loading={busyProvider === "google"} styles={styles} onSignIn={(flow) => void handleSocialSignIn(flow, "google")} />
          <NativeAuthButton
            colors={colors}
            disabled={authBusy}
            label="Continue with Email"
            onPress={() => openEmail("login")}
            outline
            styles={styles}
            testID="auth.login_email"
          />

          <View style={styles.legalWrap}>
            <Text variant="caption" tone="muted" style={[styles.legalNotice, isRTL && styles.rtlText]}>{t.auth.legalNotice}</Text>
            <View style={[styles.legalLinks, isRTL && styles.rtlRow]}>
              <Pressable accessibilityRole="link" onPress={() => void openLegalLink("terms")} hitSlop={8}>
                <Text variant="caption" tone="secondary" style={styles.legalLink}>{t.auth.termsOfService}</Text>
              </Pressable>
              <Text variant="caption" tone="muted">·</Text>
              <Pressable accessibilityRole="link" onPress={() => void openLegalLink("privacy")} hitSlop={8}>
                <Text variant="caption" tone="secondary" style={styles.legalLink}>{t.auth.privacyPolicy}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
      <EmailAuthSheet
        callbackURL={postAuthRoute}
        mode={emailSheetMode ?? "login"}
        onClose={() => setEmailSheetMode(null)}
        visible={emailSheetMode !== null}
      />
    </View>
  );
}

const createStyles = (colors: AppColors, resolvedColorScheme: "light" | "dark") => {
  const isLight = resolvedColorScheme === "light";

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  headlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    color: colors.textPrimary,
    letterSpacing: 0,
    textAlign: "center",
    flexShrink: 1,
  },
  typeDot: {
    backgroundColor: colors.textPrimary,
    marginLeft: 8,
    flexShrink: 0,
  },
  actions: {
    gap: 11,
    backgroundColor: isLight ? "#F7F7F4" : "rgba(9, 9, 11, 0.88)",
    borderWidth: 1,
    borderColor: isLight ? "rgba(17, 24, 39, 0.08)" : "rgba(63, 63, 70, 0.58)",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    marginHorizontal: -28,
    marginBottom: -Math.max(18, 0),
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 18,
  },
  button: {
    minHeight: 50,
    borderRadius: 25,
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: isLight ? "#FFFFFF" : "#18181b",
    borderWidth: isLight ? 1 : 0,
    borderColor: isLight ? "rgba(17, 24, 39, 0.10)" : "transparent",
  },
  outlineButton: {
    backgroundColor: isLight ? "#FFFFFF" : "#09090b",
    borderWidth: 1,
    borderColor: isLight ? "rgba(17, 24, 39, 0.16)" : "#27272a",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.55,
  },
  legalWrap: {
    alignItems: "center",
    gap: 6,
    paddingTop: 6,
  },
  legalNotice: {
    textAlign: "center",
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  legalLink: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  rtlRow: {
    flexDirection: "row-reverse",
  },
  rtlText: {
    textAlign: "center",
    writingDirection: "rtl",
  },
});
};
