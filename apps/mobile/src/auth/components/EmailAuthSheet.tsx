import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { Eye, EyeOff } from "lucide-react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { useSignIn, useSignUp } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isWorkspaceAuthConfigured } from "@/auth/authClient";
import { clerkEmailAuthErrorMessage, sendSignUpEmailVerificationCode, signInWithEmailPassword, signUpWithEmailPassword } from "@/auth/emailPasswordAuth";
import { mobilePostAuthRoute, sanitizeAuthCallback } from "@/auth/authNavigation";
import { markAuthSessionActive } from "@/auth/signOut";
import { useMobileAuthGate } from "@/auth/mobileAuthGate";
import { Button } from "@/foundation/primitives/Button";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useKeyboardClearance } from "@/foundation/keyboard/useKeyboardClearance";

type AuthMode = "login" | "signup";
type AuthStep = "email" | "password" | "verification";

const RESEND_CODE_COOLDOWN_SECONDS = 60;

type EmailAuthSheetProps = {
  callbackURL?: string;
  mode?: AuthMode;
  onClose?: () => void;
  visible?: boolean;
};

export function EmailAuthSheet({ callbackURL, mode: providedMode, onClose, visible = true }: EmailAuthSheetProps) {
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { colors, resolvedColorScheme } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const { dismissKeyboard, extraClearance, handleInputFocus, keyboardVisible, scrollViewRef } = useKeyboardClearance();
  const gate = useMobileAuthGate();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const postAuthRoute = sanitizeAuthCallback(callbackURL);
  const [mode, setMode] = useState<AuthMode>(providedMode ?? "login");
  const [step, setStep] = useState<AuthStep>("email");
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resentCode, setResentCode] = useState(false);
  const [error, setError] = useState("");
  const [sessionHandoffPending, setSessionHandoffPending] = useState(false);
  const submitInFlightRef = useRef(false);
  const metrics = useMemo(() => {
    const compact = height < 780 || insets.top > 48;
    const sheetTopGap = Math.max(92, insets.top + 96);
    return {
      bodySize: compact ? 12 : 13,
      buttonHeight: compact ? 41 : 44,
      inputHeight: compact ? 42 : 45,
      sheetMinHeight: Math.max(520, height - sheetTopGap),
      sheetPaddingX: Math.max(24, Math.min(32, Math.round(width * 0.07))),
      titleSize: compact ? 20 : 22,
    };
  }, [height, insets.top, width]);
  const styles = useMemo(() => createStyles(colors, metrics, resolvedColorScheme), [colors, metrics, resolvedColorScheme]);
  const snapPoints = useMemo(() => ["100%"], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={resolvedColorScheme === "light" ? 0.18 : 0.42}
        pressBehavior="close"
      />
    ),
    [resolvedColorScheme],
  );

  useEffect(() => {
    if (!visible) return;
    setMode(providedMode ?? "login");
    setStep("email");
    setFullName("");
    setPassword("");
    setPasswordVisible(false);
    setVerificationCode("");
    setNeedsVerification(false);
    setResendBusy(false);
    setResendCooldown(0);
    setResentCode(false);
    setSessionHandoffPending(false);
    setError("");
  }, [providedMode, visible]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!sessionHandoffPending || !gate.isReady || !gate.isAuthenticated || !gate.destination) return;
    const destination = postAuthRoute === "/" || postAuthRoute === "/(auth)"
      ? gate.destination
      : postAuthRoute;
    console.info(`[email-auth] session ready, routing to ${destination}`);
    router.replace(destination as never);
  }, [gate.destination, gate.isAuthenticated, gate.isReady, postAuthRoute, router, sessionHandoffPending]);

  if (gate.isReady && gate.isAuthenticated && gate.destination) {
    return <Redirect href={gate.destination} />;
  }

  const close = () => {
    onClose?.();
    if (!onClose) router.replace("/(auth)" as never);
  };

  const switchMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setStep("email");
    setFullName("");
    setPassword("");
    setPasswordVisible(false);
    setVerificationCode("");
    setNeedsVerification(false);
    setResendBusy(false);
    setResendCooldown(0);
    setResentCode(false);
    setSessionHandoffPending(false);
    setError("");
  };

  const finishAuth = () => {
    markAuthSessionActive();
    setSessionHandoffPending(true);
  };

  const submitPassword = async () => {
    if (submitInFlightRef.current || busy || sessionHandoffPending) return;

    if (!isWorkspaceAuthConfigured()) {
      Alert.alert(t.auth.signInUnavailableTitle, t.auth.signInUnavailableBody);
      return;
    }

    submitInFlightRef.current = true;
    setBusy(true);
    setError("");
    let authenticated = false;
    try {
      console.info(`[email-auth] submit start mode=${mode} step=${step}`);
      const result = mode === "login"
        ? await signInWithEmailPassword({ emailAddress, password, signIn: signIn as any })
        : await signUpWithEmailPassword({ emailAddress, fullName, needsVerification, password, signUp: signUp as any, verificationCode });
      console.info(`[email-auth] submit result status=${result.status}`);

      if (result.status === "missing_details") setError(mode === "login" ? t.auth.loginMissingDetailsBody : t.auth.registerMissingDetailsBody);
      if (result.status === "needs_verification") {
        setNeedsVerification(true);
        setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS);
        setResentCode(false);
        setStep("verification");
      }
      if (result.status === "authenticated") {
        authenticated = true;
        finishAuth();
      }
    } catch (error) {
      console.warn("[email-auth] submit failed", error);
      setError(clerkEmailAuthErrorMessage(error, t.auth.signInUnavailableBody));
    } finally {
      submitInFlightRef.current = false;
      if (!authenticated) {
        setBusy(false);
      }
    }
  };

  const resendVerificationCode = async () => {
    if (submitInFlightRef.current || busy || sessionHandoffPending || resendBusy || resendCooldown > 0 || step !== "verification") return;

    setResendBusy(true);
    setError("");
    setResentCode(false);
    try {
      console.info("[email-auth] resend verification code start");
      await sendSignUpEmailVerificationCode({ signUp: signUp as any });
      console.info("[email-auth] resend verification code done");
      setResendCooldown(RESEND_CODE_COOLDOWN_SECONDS);
      setResentCode(true);
    } catch (error) {
      console.warn("[email-auth] resend verification code failed", error);
      setError(clerkEmailAuthErrorMessage(error, t.auth.signInUnavailableBody));
    } finally {
      setResendBusy(false);
    }
  };

  const openLegalLink = async (path: "terms" | "privacy") => {
    try {
      await Linking.openURL(`https://app.qentrah.com/${path}`);
    } catch {
      Alert.alert(t.auth.signInUnavailableTitle, t.auth.signInUnavailableBody);
    }
  };

  const title = step === "verification" ? "Verify email" : mode === "login" ? "Sign in" : "Sign up";
  const body = step === "verification" ? `Enter the code sent to ${emailAddress.trim() || "your email"}.` : "Use your email and password to continue.";
  const canContinue = step === "verification"
    ? Boolean(verificationCode.trim())
    : Boolean(emailAddress.trim() && password && (mode === "login" || fullName.trim()));
  const modeSwitchPrefix = mode === "login" ? "No account?" : "Already have an account?";
  const modeSwitchAction = mode === "login" ? "Sign up" : "Sign in";
  const submitLabel = sessionHandoffPending ? "Opening..." : busy ? (step === "verification" ? "Verifying..." : mode === "signup" ? t.auth.initializing : t.auth.signingIn) : "Continue";
  const inputDisabled = busy || sessionHandoffPending;
  const resendDisabled = inputDisabled || resendBusy || resendCooldown > 0;
  const resendLabel = resendBusy ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend";
  const submitSpinnerColor = resolvedColorScheme === "light" ? colors.surface : colors.background;

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={dismissKeyboard}
        onStartShouldSetResponderCapture={() => {
          dismissKeyboard();
          return false;
        }}
        showsVerticalScrollIndicator={false}
      >
      <Animated.View entering={FadeIn.duration(160)} layout={LinearTransition.duration(180)} style={styles.content}>
        <Animated.View
          layout={LinearTransition.duration(180)}
          style={[styles.sheet, { paddingTop: Math.max(14, insets.top + 8), paddingBottom: Math.max(insets.bottom + 14, keyboardVisible ? extraClearance + 24 : 18) }]}
        >
          <View style={styles.grabber} />

          <Animated.View layout={LinearTransition.duration(180)} style={styles.main}>
            <Animated.View key={`${mode}-${step}-copy`} entering={FadeInDown.duration(150)} exiting={FadeOut.duration(90)} layout={LinearTransition.duration(180)} style={styles.copyBlock}>
              <Text variant="label" style={[styles.title, isRTL && styles.rtlText]}>{title}</Text>
              <Text tone="secondary" style={[styles.body, isRTL && styles.rtlText]}>{body}</Text>
            </Animated.View>

            <Animated.View layout={LinearTransition.duration(180)} style={styles.fields}>
              {mode === "signup" && step !== "verification" ? (
                <Animated.View entering={FadeInDown.duration(160)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)}>
                  <TextInput
                    testID="auth.email.full_name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!inputDisabled}
                    textContentType="name"
                    onSubmitEditing={submitPassword}
                    onFocus={() => handleInputFocus("fullName")}
                    style={[styles.input, isRTL && styles.inputRtl]}
                    textAlign={isRTL ? "right" : "left"}
                  />
                </Animated.View>
              ) : null}

              {step !== "verification" ? (
                <Animated.View entering={FadeInDown.duration(150)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)}>
                  <TextInput
                    testID="auth.email.email"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!inputDisabled}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    onSubmitEditing={submitPassword}
                    onFocus={() => handleInputFocus("email")}
                    style={[styles.input, styles.emailEntryInput, isRTL && styles.inputRtl]}
                    textAlign={isRTL ? "right" : "left"}
                  />
                </Animated.View>
              ) : null}

              {step !== "verification" ? (
                <Animated.View entering={FadeInDown.duration(150)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)} style={styles.passwordRow}>
                  <TextInput
                    testID="auth.email.password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    editable={!inputDisabled}
                    secureTextEntry={!passwordVisible}
                    textContentType={mode === "login" ? "password" : "newPassword"}
                    onSubmitEditing={submitPassword}
                    onFocus={() => handleInputFocus("password")}
                    style={[styles.passwordInput, isRTL && styles.inputRtl]}
                    textAlign={isRTL ? "right" : "left"}
                  />
                  <Pressable
                    accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                    disabled={inputDisabled}
                    hitSlop={10}
                    onPress={() => setPasswordVisible((visible) => !visible)}
                    style={[styles.passwordVisibilityButton, inputDisabled && styles.iconButtonDisabled]}
                  >
                    {passwordVisible ? (
                      <EyeOff size={20} color={colors.textPrimary} strokeWidth={2.4} />
                    ) : (
                      <Eye size={20} color={colors.textPrimary} strokeWidth={2.4} />
                    )}
                  </Pressable>
                </Animated.View>
              ) : null}

              {mode === "signup" && step !== "verification" ? (
                <View nativeID="clerk-captcha" collapsable={false} style={styles.captchaSlot} />
              ) : null}

              {step === "verification" ? (
                <Animated.View entering={FadeInDown.duration(160)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)}>
                  <TextInput
                    testID="auth.email.verification_code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholder="Email code"
                    placeholderTextColor={colors.textMuted}
                    editable={!inputDisabled}
                    keyboardType="number-pad"
                    onSubmitEditing={submitPassword}
                    onFocus={() => handleInputFocus("verification")}
                    style={[styles.input, isRTL && styles.inputRtl]}
                    textAlign={isRTL ? "right" : "left"}
                  />
                  <View style={[styles.resendRow, isRTL && styles.rtlRow]}>
                    <Text variant="caption" tone="muted" style={styles.resendText}>
                      {resentCode ? "Code sent again." : "Didn't get a code?"}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      disabled={resendDisabled}
                      hitSlop={8}
                      onPress={() => void resendVerificationCode()}
                    >
                      <Text variant="caption" style={[styles.resendLink, resendDisabled && styles.modeSwitchDisabled]}>
                        {resendLabel}
                      </Text>
                    </Pressable>
                  </View>
                </Animated.View>
              ) : null}
            </Animated.View>

            {error ? (
              <Animated.View entering={FadeInDown.duration(120)} exiting={FadeOut.duration(90)} layout={LinearTransition.duration(160)}>
                <Text style={[styles.error, isRTL && styles.rtlText]}>{error}</Text>
              </Animated.View>
            ) : null}
          </Animated.View>

          <Animated.View layout={LinearTransition.duration(180)} style={styles.bottomAction}>
            <Button
              testID="auth.email.submit"
              label={submitLabel}
              disabled={sessionHandoffPending || busy || !canContinue}
              leading={sessionHandoffPending || busy ? <ActivityIndicator color={submitSpinnerColor} size="small" /> : undefined}
              onPress={submitPassword}
              style={[styles.submit, !canContinue && styles.submitDisabled]}
              textStyle={styles.submitText}
            />
            <View style={[styles.modeSwitchRow, isRTL && styles.rtlRow]}>
              <Text variant="caption" tone="muted" style={styles.modeSwitchText}>{modeSwitchPrefix}</Text>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                hitSlop={8}
                onPress={switchMode}
              >
                <Text variant="caption" style={[styles.modeSwitchLink, busy && styles.modeSwitchDisabled]}>{modeSwitchAction}</Text>
              </Pressable>
            </View>
          </Animated.View>
          <View style={[styles.legalLinks, isRTL && styles.rtlRow]}>
            <Pressable accessibilityRole="link" onPress={() => void openLegalLink("terms")} hitSlop={8}>
              <Text variant="caption" tone="secondary" style={styles.legalLink}>{t.auth.termsOfService}</Text>
            </Pressable>
            <Text variant="caption" tone="muted">·</Text>
            <Pressable accessibilityRole="link" onPress={() => void openLegalLink("privacy")} hitSlop={8}>
              <Text variant="caption" tone="secondary" style={styles.legalLink}>{t.auth.privacyPolicy}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View pointerEvents={visible ? "auto" : "none"} style={StyleSheet.absoluteFill}>
      <BottomSheet
        ref={bottomSheetRef}
        index={visible ? 0 : -1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        onClose={close}
        handleComponent={null}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {content}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const createStyles = (colors: AppColors, metrics: {
  bodySize: number;
  buttonHeight: number;
  inputHeight: number;
  sheetMinHeight: number;
  sheetPaddingX: number;
  titleSize: number;
}, resolvedColorScheme: "light" | "dark") => {
  const isLight = resolvedColorScheme === "light";
  const palette = {
    sheet: colors.card,
    field: isLight ? "#F2F2F7" : "#2C2C2E",
    fieldBorder: isLight ? "rgba(60,60,67,0.10)" : "rgba(84,84,88,0.34)",
    muted: colors.textMuted,
    legal: colors.textSecondary,
    primary: colors.accent,
    primaryText: colors.background,
    disabled: isLight ? "#D1D1D6" : "#3A3A3C",
    grabber: colors.border,
  };

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  bottomSheetBackground: {
    backgroundColor: palette.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  bottomSheetContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
  },
  grabber: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: palette.grabber,
    marginBottom: 12,
  },
  sheet: {
    alignSelf: "stretch",
    backgroundColor: palette.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: metrics.sheetPaddingX,
    minHeight: metrics.sheetMinHeight,
  },
  main: {
    alignItems: "stretch",
    gap: 0,
    paddingTop: 22,
  },
  copyBlock: {
    alignItems: "flex-start",
    gap: 7,
  },
  title: {
    color: colors.textPrimary,
    fontSize: metrics.titleSize,
    lineHeight: metrics.titleSize + 5,
    fontFamily: "Manrope_800ExtraBold",
    fontWeight: "800",
    textAlign: "left",
  },
  body: {
    color: palette.muted,
    fontSize: metrics.bodySize,
    lineHeight: metrics.bodySize + 6,
    fontFamily: "Manrope_500Medium",
    textAlign: "left",
    maxWidth: 340,
  },
  fields: {
    alignSelf: "stretch",
    gap: 8,
    marginTop: 24,
  },
  input: {
    height: metrics.inputHeight,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.field,
    color: colors.textPrimary,
    paddingHorizontal: 13,
    paddingVertical: 0,
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
  },
  emailEntryInput: {
    fontSize: 15,
  },
  readonlyInput: {
    height: metrics.inputHeight,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.field,
    paddingHorizontal: 13,
    justifyContent: "center",
    gap: 4,
  },
  fieldLabel: {
    color: palette.muted,
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    lineHeight: 13,
  },
  emailValue: {
    color: colors.textPrimary,
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    lineHeight: 17,
  },
  passwordRow: {
    height: metrics.inputHeight,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.fieldBorder,
    backgroundColor: palette.field,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 13,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: metrics.inputHeight - 2,
    color: colors.textPrimary,
    paddingVertical: 0,
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
  },
  passwordVisibilityButton: {
    alignItems: "center",
    height: 30,
    justifyContent: "center",
    marginLeft: 7,
    width: 30,
  },
  captchaSlot: {
    alignSelf: "stretch",
    justifyContent: "center",
    minHeight: 72,
    overflow: "visible",
    paddingTop: 2,
  },
  inputRtl: {
    writingDirection: "rtl",
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "left",
    paddingTop: 4,
  },
  submit: {
    alignSelf: "stretch",
    minHeight: metrics.buttonHeight,
    borderRadius: metrics.buttonHeight / 2,
    backgroundColor: palette.primary,
  },
  bottomAction: {
    alignSelf: "stretch",
    paddingTop: 18,
  },
  modeSwitchRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    paddingTop: 14,
  },
  modeSwitchText: {
    color: palette.muted,
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  modeSwitchLink: {
    color: colors.textPrimary,
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    lineHeight: 16,
  },
  modeSwitchDisabled: {
    opacity: 0.45,
  },
  resendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    paddingTop: 11,
  },
  resendText: {
    color: palette.muted,
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    lineHeight: 16,
  },
  resendLink: {
    color: colors.textPrimary,
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    lineHeight: 16,
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  submitDisabled: {
    backgroundColor: palette.disabled,
    opacity: 1,
  },
  submitText: {
    color: palette.primaryText,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 15,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
    paddingBottom: 16,
  },
  legalLink: {
    color: palette.legal,
    fontFamily: "Manrope_500Medium",
    fontSize: 10,
    lineHeight: 14,
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
