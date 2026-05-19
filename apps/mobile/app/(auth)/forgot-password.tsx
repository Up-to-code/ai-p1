import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react-native";

import { Button } from "@/foundation/primitives/Button";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { AuthField } from "@/auth/components/AuthField";
import { authClient } from "@/auth/authClient";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  const styles = StyleSheet.create({
    container: {
      padding: 0,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 24,
      gap: 16,
    },
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.textPrimary,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: "center",
      gap: 40,
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
      textAlign: isRTL ? "right" : "left",
    },
    form: {
      gap: 20,
    },
    actions: {
      gap: 16,
    },
    mainBtn: {
      height: 64,
      backgroundColor: colors.textPrimary,
    },
    shieldWrap: {
      alignItems: "center",
      gap: 12,
      opacity: 0.7,
      marginTop: 20,
    },
  });

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert(t.auth.missingDetailTitle, t.auth.missingDetailBody);
      return;
    }
    setPending(true);
    try {
      const result = await (authClient as any).forgotPassword({
        email: email.trim(),
      });
      if (result?.error) {
        throw new Error(result.error.message ?? "Unable to request password reset.");
      }
      Alert.alert(
        t.auth.resetLinkSentTitle,
        t.auth.resetLinkSentBody,
        [{ text: t.auth.backToLogin, onPress: () => router.replace("/(auth)/login") }],
      );
    } catch (error) {
      Alert.alert(t.auth.resetFailedTitle, error instanceof Error ? error.message : "Unable to request password reset.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
          </Pressable>
          <Text variant="title" style={styles.headerTitle}>{t.auth.forgotHeader}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.intro}>
              <Text variant="display" style={styles.display}>{t.auth.forgotTitle}</Text>
              <Text style={styles.subtitle}>
                {t.auth.forgotBody}
              </Text>
            </Animated.View>

            <View style={styles.form}>
              <AuthField
                label={t.auth.email}
                icon={Mail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actions}>
              <Button
                label={pending ? t.auth.sending : t.auth.requestResetLink}
                variant="primary"
                onPress={() => void handleReset()}
                style={styles.mainBtn}
                textStyle={{ color: colors.background }}
                disabled={pending}
              />
            </Animated.View>

            <View style={styles.shieldWrap}>
              <ShieldCheck size={24} color={colors.textPrimary} />
              <Text variant="caption" style={{ textAlign: "center", lineHeight: 18, color: colors.textSecondary }}>
                IDENTITY VERIFICATION MAY BE REQUIRED{"\n"}BEFORE RESTORING ACCESS
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
