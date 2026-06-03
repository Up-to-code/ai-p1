/* eslint-disable max-lines */
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BadgeCheck, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { authClient, isWorkspaceAuthConfigured } from "@/auth/authClient";
import { authErrorMessage, resetPasswordReason } from "@/auth/authErrors";
import { firstSearchParam, authRouteWithCallback, sanitizeAuthCallback } from "@/auth/authNavigation";
import { AuthField } from "@/auth/components/AuthField";
import { AuthGlassSurface } from "@/auth/components/AuthGlassSurface";
import { markAuthSessionActive } from "@/auth/signOut";
import {
  confirmWorkspaceEmailVerification,
  confirmWorkspacePasswordReset,
  requestWorkspacePasswordReset,
  signInWithWorkspaceEmailPassword,
  type MobileEmailVerificationChallenge,
} from "@/auth/socialAuth";
import { useAppLocalization } from "@/foundation/localization";
import { Button } from "@/foundation/primitives/Button";
import { Text } from "@/foundation/primitives/Text";
import { useSystemUI } from "@/foundation/system/useSystemUI";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type AuthFlowError = Error & {
  emailVerification?: MobileEmailVerificationChallenge;
};
type AuthMode = "sign-in" | "reset" | "verify-email";
const resetResendCooldownMs = 60_000;

function maskedEmail(value: string) {
  const [name = "", domain = ""] = value.trim().split("@");
  if (!name || !domain) return value;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"•".repeat(Math.max(2, Math.min(5, name.length)))}@${domain}`;
}

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    callbackURL?: string | string[];
    email?: string | string[];
    emailVerification?: string | string[];
    pendingAuthenticationToken?: string | string[];
  }>();
  const callbackURL = sanitizeAuthCallback(params.callbackURL);
  const initialEmailVerification = firstSearchParam(params.emailVerification) === "1";
  const initialEmail = firstSearchParam(params.email) ?? "";
  const initialPendingAuthenticationToken = firstSearchParam(params.pendingAuthenticationToken) ?? "";
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const { sizes } = useSystemUI();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(
    () => createStyles(colors, resolvedColorScheme === "dark", isRTL, sizes.auth),
    [colors, resolvedColorScheme, isRTL, sizes.auth],
  );
  const inFlightRef = useRef(false);
  const [authMode, setAuthMode] = useState<AuthMode>(
    initialEmailVerification && initialEmail && initialPendingAuthenticationToken ? "verify-email" : "sign-in",
  );
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailVerification, setEmailVerification] = useState<MobileEmailVerificationChallenge | null>(
    initialEmailVerification && initialEmail && initialPendingAuthenticationToken
      ? {
        code: "email_verification_required",
        email: initialEmail,
        pendingAuthenticationToken: initialPendingAuthenticationToken,
      }
      : null,
  );
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetCooldownUntil, setResetCooldownUntil] = useState(0);
  const [resetCountdown, setResetCountdown] = useState(0);
  const canShowPassword = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.trim());
  const isResetMode = authMode === "reset";
  const isEmailVerificationMode = authMode === "verify-email";
  const resetEmail = email.trim();
  const resetCooldownRemaining = Math.max(
    resetCountdown,
    Math.ceil((resetCooldownUntil - Date.now()) / 1000),
    0,
  );
  const shouldShowResetPasswords = resetToken.trim().length > 0;

  useEffect(() => {
    if (!resetCooldownUntil) {
      setResetCountdown(0);
      return undefined;
    }

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((resetCooldownUntil - Date.now()) / 1000));
      setResetCountdown(seconds);
      if (seconds === 0) setResetCooldownUntil(0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [resetCooldownUntil]);

  const continueEmailVerification = (challenge: MobileEmailVerificationChallenge) => {
    setEmail(challenge.email);
    setEmailVerification(challenge);
    setEmailVerificationCode("");
    setAuthMode("verify-email");
    setPassword("");
  };

  const submit = async () => {
    if (inFlightRef.current) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert(t.auth.missingDetailsTitle, t.auth.loginMissingDetailsBody);
      return;
    }
    inFlightRef.current = true;
    setIsSigningIn(true);

    try {
      if (!isWorkspaceAuthConfigured()) throw new Error(t.auth.signInUnavailableBody);
      await signInWithWorkspaceEmailPassword(authClient, { email, password });
      markAuthSessionActive();
      router.replace(callbackURL as never);
    } catch (error) {
      const authError = error as AuthFlowError;
      if (authError.emailVerification) {
        continueEmailVerification(authError.emailVerification);
      } else {
        Alert.alert(t.auth.signInFailedTitle, authErrorMessage(error, t.auth.signInUnavailableBody));
      }
    } finally {
      inFlightRef.current = false;
      setIsSigningIn(false);
    }
  };

  const requestReset = async () => {
    if (!resetEmail) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.missingDetailBody);
      return;
    }
    if (resetCooldownRemaining > 0) return;
    setIsResetting(true);
    try {
      await requestWorkspacePasswordReset(authClient, resetEmail);
      setResetRequested(true);
      setResetCooldownUntil(Date.now() + resetResendCooldownMs);
    } catch (error) {
      Alert.alert(t.auth.resetFailedTitle, resetPasswordReason(error));
    } finally {
      setIsResetting(false);
    }
  };

  const beginResetFlow = () => {
    if (!resetEmail) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.missingDetailBody);
      return;
    }
    setAuthMode("reset");
    setPassword("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    if (!resetRequested && resetCooldownRemaining === 0) void requestReset();
  };

  const completeEmailVerification = async () => {
    if (!emailVerification) return;
    if (!emailVerificationCode.trim()) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.emailVerificationCodePlaceholder);
      return;
    }

    setIsSigningIn(true);
    try {
      await confirmWorkspaceEmailVerification(authClient, {
        code: emailVerificationCode.trim(),
        pendingAuthenticationToken: emailVerification.pendingAuthenticationToken,
      });
      markAuthSessionActive();
      router.replace(callbackURL as never);
    } catch (error) {
      Alert.alert(t.auth.signInFailedTitle, authErrorMessage(error, t.auth.signInUnavailableBody));
    } finally {
      setIsSigningIn(false);
    }
  };

  const completeReset = async () => {
    if (!resetToken.trim()) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.resetTokenPlaceholder);
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t.auth.resetFailedTitle, t.auth.resetPasswordShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t.auth.resetFailedTitle, t.auth.resetPasswordMismatch);
      return;
    }

    setIsResetting(true);
    try {
      await confirmWorkspacePasswordReset(authClient, {
        token: resetToken.trim(),
        newPassword,
      });
      Alert.alert(t.auth.resetCompleteTitle, t.auth.resetCompleteBody);
      setAuthMode("sign-in");
      setResetRequested(false);
      setPassword("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert(t.auth.resetFailedTitle, resetPasswordReason(error));
    } finally {
      setIsResetting(false);
    }
  };

  const primaryLabel = isResetMode
    ? resetRequested
      ? isResetting ? t.auth.sending : t.auth.completeReset
      : isResetting ? t.auth.sending : t.auth.requestResetLink
    : isEmailVerificationMode
      ? isSigningIn ? t.auth.signingIn : t.auth.confirmEmail
      : isSigningIn ? t.auth.signingIn : t.auth.logIn;

  const primaryAction = () => {
    if (isResetMode) return resetRequested ? completeReset() : requestReset();
    if (isEmailVerificationMode) return completeEmailVerification();
    return submit();
  };

  const returnToLogin = () => {
    setAuthMode("sign-in");
    setResetRequested(false);
    setResetCooldownUntil(0);
    setEmailVerification(null);
    setEmailVerificationCode("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
      style={[styles.container, { paddingTop: insets.top + 16 }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 18) + 118 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AuthGlassSurface style={styles.backButton}>
            <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.replace("/(auth)")}>
              <Text tone="muted" style={styles.backText}>{isRTL ? "→" : "←"}</Text>
            </Pressable>
          </AuthGlassSurface>
          <View style={styles.titleBlock}>
            <Text variant="title" style={styles.title}>
              {isResetMode ? t.auth.forgotTitle : isEmailVerificationMode ? t.auth.emailVerificationTitle : t.auth.loginTitle}
            </Text>
            <Text tone="secondary" style={styles.body}>
              {isResetMode ? t.auth.forgotBody : isEmailVerificationMode ? t.auth.emailVerificationBody : t.auth.loginBodyDefault}
            </Text>
          </View>
        </View>

        <Animated.View layout={LinearTransition.duration(220)} style={styles.form}>
          <AuthField
            label={t.auth.email}
            icon={Mail}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder={t.auth.emailPlaceholder}
            textContentType="emailAddress"
          />
          {!isResetMode && !isEmailVerificationMode && canShowPassword ? (
            <Animated.View
              entering={FadeInDown.duration(210)}
              exiting={FadeOutUp.duration(150)}
              layout={LinearTransition.duration(220)}
              style={styles.revealedGroup}
            >
              <AuthField
                label={t.auth.password}
                icon={LockKeyhole}
                value={password}
                onChangeText={setPassword}
                placeholder={t.auth.passwordPlaceholder}
                secureTextEntry={!passwordVisible}
                textContentType="password"
                trailing={
                  <Pressable
                    accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setPasswordVisible((current) => !current)}
                    testID="auth.password_visibility_toggle"
                  >
                    {passwordVisible
                      ? <EyeOff size={18} color={colors.textSecondary} />
                      : <Eye size={18} color={colors.textSecondary} />}
                  </Pressable>
                }
              />
              <Pressable accessibilityRole="button" disabled={isResetting} onPress={beginResetFlow}>
                <Text tone="secondary" style={styles.forgotLink}>{t.auth.forgotPassword}</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {isResetMode ? (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(150)}
              layout={LinearTransition.duration(220)}
              style={styles.revealedGroup}
            >
              <Text tone="secondary" style={[styles.resetMeta, isRTL && styles.rtlText]}>
                {resetRequested
                  ? `${t.auth.resetLinkSentBody} ${maskedEmail(resetEmail)}`
                  : t.auth.sending}
              </Text>
              <AuthField
                label={t.auth.resetToken}
                icon={BadgeCheck}
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t.auth.resetTokenPlaceholder}
              />
              {shouldShowResetPasswords ? (
                <Animated.View
                  entering={FadeInDown.duration(200)}
                  exiting={FadeOutUp.duration(140)}
                  layout={LinearTransition.duration(210)}
                  style={styles.revealedGroup}
                >
                  <AuthField
                    label={t.auth.newPassword}
                    icon={LockKeyhole}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t.auth.passwordMinPlaceholder}
                    secureTextEntry={!passwordVisible}
                    textContentType="newPassword"
                  />
                  <AuthField
                    label={t.auth.confirmPassword}
                    icon={LockKeyhole}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t.auth.passwordMinPlaceholder}
                    secureTextEntry={!passwordVisible}
                    textContentType="newPassword"
                  />
                </Animated.View>
              ) : null}
              <View style={styles.resendRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isResetting || resetCooldownRemaining > 0}
                  hitSlop={8}
                  onPress={() => void requestReset()}
                >
                  <Text
                    tone={resetCooldownRemaining > 0 ? "muted" : "accent"}
                    style={styles.resendText}
                  >
                    {resetCooldownRemaining > 0
                      ? `${t.auth.resendResetCodeIn} ${resetCooldownRemaining}s`
                      : t.auth.resendResetCode}
                  </Text>
                </Pressable>
              </View>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={returnToLogin}>
                <Text tone="accent" style={styles.switchLink}>{t.auth.backToLogin}</Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {isEmailVerificationMode && emailVerification ? (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(150)}
              layout={LinearTransition.duration(220)}
              style={styles.revealedGroup}
            >
              <Text tone="secondary" style={[styles.resetMeta, isRTL && styles.rtlText]}>
                {`${t.auth.emailVerificationSentTo} ${maskedEmail(emailVerification.email)}`}
              </Text>
              <AuthField
                label={t.auth.emailVerificationCode}
                icon={BadgeCheck}
                value={emailVerificationCode}
                onChangeText={setEmailVerificationCode}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="number-pad"
                placeholder={t.auth.emailVerificationCodePlaceholder}
              />
              <Pressable accessibilityRole="button" hitSlop={8} onPress={returnToLogin}>
                <Text tone="accent" style={styles.switchLink}>{t.auth.backToLogin}</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>

        {!isResetMode && !isEmailVerificationMode ? (
          <View style={styles.switchWrap}>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => router.replace(authRouteWithCallback("/(auth)/register", callbackURL) as never)}
            >
              <Text tone="accent" style={styles.switchLink}>{t.auth.createAccount}</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <AuthGlassSurface style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          testID="auth.email_password_sign_in"
          label={primaryLabel}
          disabled={isSigningIn || isResetting}
          onPress={() => void primaryAction()}
          style={styles.submitButton}
          textStyle={styles.submitLabel}
        />
      </AuthGlassSurface>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: AppColors, isDark: boolean, isRTL: boolean, authSizes: ReturnType<typeof useSystemUI>["sizes"]["auth"]) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: authSizes.horizontalPadding,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    gap: 28,
  },
  header: {
    gap: 24,
  },
  backText: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 24,
    lineHeight: 30,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  titleBlock: {
    gap: 10,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  title: {
    color: colors.textPrimary,
    fontSize: authSizes.titleFontSize,
    lineHeight: authSizes.titleLineHeight,
    textAlign: isRTL ? "right" : "left",
  },
  body: {
    lineHeight: 22,
    textAlign: isRTL ? "right" : "left",
  },
  form: {
    gap: 16,
    marginTop: 0,
  },
  revealedGroup: {
    gap: 16,
  },
  submitButton: {
    minHeight: authSizes.buttonHeight,
    marginTop: 0,
    backgroundColor: isDark ? "#F5F7FB" : "#171C24",
  },
  submitLabel: {
    color: isDark ? "#20242D" : "#F5F7FB",
    fontSize: authSizes.buttonFontSize,
    lineHeight: authSizes.buttonLineHeight,
  },
  forgotLink: {
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
    paddingVertical: theme.spacing.sm,
  },
  switchWrap: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingBottom: 0,
  },
  switchLink: {
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
  },
  resetMeta: {
    lineHeight: 21,
    textAlign: isRTL ? "right" : "left",
  },
  resendRow: {
    alignItems: "center",
  },
  resendText: {
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
  },
  rtlText: {
    writingDirection: "rtl",
  },
  bottomBar: {
    borderRadius: authSizes.bottomBarRadius,
    bottom: 0,
    left: authSizes.horizontalPadding,
    padding: authSizes.bottomBarPadding,
    position: "absolute",
    right: authSizes.horizontalPadding,
  },
});
