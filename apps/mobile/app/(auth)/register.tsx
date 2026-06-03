/* eslint-disable max-lines */
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BadgeCheck, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from "react-native-reanimated";

import { authClient, isWorkspaceAuthConfigured } from "@/auth/authClient";
import { authErrorMessage } from "@/auth/authErrors";
import { authRouteWithCallback, sanitizeAuthCallback } from "@/auth/authNavigation";
import { AuthGlassSurface } from "@/auth/components/AuthGlassSurface";
import { AuthField } from "@/auth/components/AuthField";
import { markAuthSessionActive } from "@/auth/signOut";
import {
  confirmWorkspaceEmailVerification,
  registerWithWorkspaceEmailPassword,
  type MobileEmailVerificationChallenge,
} from "@/auth/socialAuth";
import { Button } from "@/foundation/primitives/Button";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { useSystemUI } from "@/foundation/system/useSystemUI";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthFlowError = Error & {
  emailVerification?: MobileEmailVerificationChallenge;
};

function maskedEmail(value: string) {
  const [name = "", domain = ""] = value.trim().split("@");
  if (!name || !domain) return value;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(2, Math.min(5, name.length)))}@${domain}`;
}

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ callbackURL?: string | string[] }>();
  const callbackURL = sanitizeAuthCallback(params.callbackURL);
  const insets = useSafeAreaInsets();
  const { colors, resolvedColorScheme } = useTheme();
  const { sizes } = useSystemUI();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(
    () => createStyles(colors, resolvedColorScheme === "dark", isRTL, sizes.auth),
    [colors, resolvedColorScheme, isRTL, sizes.auth],
  );
  const inFlightRef = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailVerification, setEmailVerification] = useState<MobileEmailVerificationChallenge | null>(null);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const isEmailVerificationMode = Boolean(emailVerification);

  const continueEmailVerification = (challenge: MobileEmailVerificationChallenge) => {
    setEmail(challenge.email);
    setEmailVerification(challenge);
    setEmailVerificationCode("");
    setPassword("");
  };

  const completeEmailVerification = async () => {
    if (!emailVerification) return;
    if (!emailVerificationCode.trim()) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.emailVerificationCodePlaceholder);
      return;
    }

    setIsSigningUp(true);
    try {
      await confirmWorkspaceEmailVerification(authClient, {
        code: emailVerificationCode.trim(),
        pendingAuthenticationToken: emailVerification.pendingAuthenticationToken,
      });
      markAuthSessionActive();
      router.replace(callbackURL as never);
    } catch (error) {
      Alert.alert(t.auth.registerFailedTitle, authErrorMessage(error, t.auth.signInUnavailableBody));
    } finally {
      setIsSigningUp(false);
    }
  };

  const submit = async () => {
    if (inFlightRef.current) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(t.auth.missingDetailsTitle, t.auth.registerMissingDetailsBody);
      return;
    }

    inFlightRef.current = true;
    setIsSigningUp(true);
    try {
      if (!isWorkspaceAuthConfigured()) throw new Error(t.auth.signInUnavailableBody);
      await registerWithWorkspaceEmailPassword(authClient, { name, email, password });
      markAuthSessionActive();
      router.replace(callbackURL as never);
    } catch (error) {
      const authError = error as AuthFlowError;
      if (authError.emailVerification) {
        continueEmailVerification(authError.emailVerification);
      } else {
        Alert.alert(t.auth.registerFailedTitle, authErrorMessage(error, t.auth.signInUnavailableBody));
      }
    } finally {
      inFlightRef.current = false;
      setIsSigningUp(false);
    }
  };

  const returnToRegistration = () => {
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
          { paddingBottom: Math.max(insets.bottom, 18) + 112 },
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
              {isEmailVerificationMode ? t.auth.emailVerificationTitle : t.auth.registerTitle}
            </Text>
            <Text tone="secondary" style={styles.body}>
              {isEmailVerificationMode ? t.auth.emailVerificationBody : t.auth.registerBodyDefault}
            </Text>
          </View>
        </View>

        <Animated.View layout={LinearTransition.duration(220)} style={styles.form}>
          {isEmailVerificationMode && emailVerification ? (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(150)}
              layout={LinearTransition.duration(220)}
              style={styles.revealedGroup}
            >
              <Text tone="secondary" style={[styles.metaText, isRTL && styles.rtlText]}>
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
              <Pressable accessibilityRole="button" hitSlop={8} onPress={returnToRegistration}>
                <Text tone="accent" style={styles.switchLink}>{t.auth.createAccount}</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInDown.duration(220)}
              exiting={FadeOutUp.duration(150)}
              layout={LinearTransition.duration(220)}
              style={styles.revealedGroup}
            >
              <AuthField
                label={t.auth.fullName}
                icon={UserRound}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholder={t.auth.namePlaceholder}
                textContentType="name"
              />
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
              <AuthField
                label={t.auth.password}
                icon={LockKeyhole}
                value={password}
                onChangeText={setPassword}
                placeholder={t.auth.passwordMinPlaceholder}
                secureTextEntry={!passwordVisible}
                textContentType="newPassword"
                trailing={
                  <Pressable
                    accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setPasswordVisible((current) => !current)}
                    testID="auth.register_password_visibility_toggle"
                  >
                    {passwordVisible
                      ? <EyeOff size={18} color={colors.textSecondary} />
                      : <Eye size={18} color={colors.textSecondary} />}
                  </Pressable>
                }
              />
            </Animated.View>
          )}
        </Animated.View>

        {!isEmailVerificationMode ? (
          <View style={styles.switchWrap}>
          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            onPress={() => router.replace(authRouteWithCallback("/(auth)/login", callbackURL) as never)}
          >
            <Text tone="accent" style={styles.switchLink}>{t.auth.logIn}</Text>
          </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <AuthGlassSurface style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          testID="auth.email_password_sign_up"
          label={isEmailVerificationMode
            ? isSigningUp ? t.auth.signingIn : t.auth.confirmEmail
            : isSigningUp ? t.auth.initializing : t.auth.createAccount}
          disabled={isSigningUp}
          onPress={() => void (isEmailVerificationMode ? completeEmailVerification() : submit())}
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
  switchWrap: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingBottom: 0,
  },
  switchLink: {
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
  },
  metaText: {
    lineHeight: 21,
    textAlign: isRTL ? "right" : "left",
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
