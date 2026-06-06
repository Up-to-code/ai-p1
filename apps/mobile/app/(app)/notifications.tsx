import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell, BellOff, ChevronLeft, ChevronRight, Loader2, Smartphone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useAppLocalization } from "@/foundation/localization";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { AppColors } from "@/foundation/theme/tokens";
import { getPushDeviceStatus, type PushDeviceStatus } from "@/persistence/api/notificationsApi";
import { registerCurrentDeviceForPush, unregisterCurrentDeviceForPush } from "@/notifications/mobilePushNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const [status, setStatus] = useState<PushDeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const activeDevice = status?.devices.find((device) => device.status === "active") ?? null;

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getPushDeviceStatus());
    } catch (error) {
      Alert.alert(t.profile.notifications, error instanceof Error ? error.message : t.notifications.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.notifications.loadFailed, t.profile.notifications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStatus]);

  async function enablePush() {
    setSaving(true);
    try {
      const result = await registerCurrentDeviceForPush();
      if (result.status === "denied") {
        Alert.alert(t.notifications.permissionDeniedTitle, t.notifications.permissionDeniedBody);
        return;
      }
      if (result.status === "unsupported") {
        Alert.alert(t.notifications.unsupportedTitle, t.notifications.unsupportedBody);
        return;
      }
      if (result.status === "missingProjectId") {
        Alert.alert(t.notifications.setupMissingTitle, t.notifications.setupMissingBody);
        return;
      }
      await loadStatus();
    } catch (error) {
      Alert.alert(t.notifications.enableFailedTitle, error instanceof Error ? error.message : t.notifications.enableFailedBody);
    } finally {
      setSaving(false);
    }
  }

  async function disablePush() {
    setSaving(true);
    try {
      await unregisterCurrentDeviceForPush();
      await loadStatus();
    } catch (error) {
      Alert.alert(t.notifications.disableFailedTitle, error instanceof Error ? error.message : t.notifications.disableFailedBody);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.backBtn} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 78, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="display" style={styles.title}>{t.notifications.title}</Text>
        </View>

        <View style={styles.statusSection}>
          <View style={styles.statusTop}>
            {status?.hasActiveDevice ? (
              <Smartphone size={24} color={colors.textPrimary} />
            ) : (
              <BellOff size={24} color={colors.textPrimary} />
            )}
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>
                {loading ? t.notifications.checking : status?.hasActiveDevice ? t.notifications.enabled : t.notifications.disabled}
              </Text>
              <Text variant="caption" tone="muted" style={styles.statusBody}>
                {activeDevice?.tokenLast4
                  ? t.notifications.deviceToken.replace("{last4}", activeDevice.tokenLast4)
                  : status?.hasActiveDevice
                    ? t.notifications.deviceReady
                    : t.notifications.deviceMissing}
              </Text>
            </View>
          </View>

          <Pressable
            disabled={loading || saving}
            onPress={status?.hasActiveDevice ? disablePush : enablePush}
            style={[styles.primaryButton, (loading || saving) && styles.disabledButton]}
          >
            {saving ? <Loader2 size={18} color={colors.background} /> : null}
            <Text style={styles.primaryButtonText}>
              {status?.hasActiveDevice ? t.notifications.disable : t.notifications.enable}
            </Text>
          </Pressable>
        </View>

        <View style={styles.rulesSection}>
          <Text style={styles.rulesTitle}>{t.notifications.defaultsTitle}</Text>
          <View style={styles.ruleChips}>
            <Text style={styles.ruleChip}>{t.notifications.calendar30}</Text>
            <Text style={styles.ruleChip}>{t.notifications.calendar5}</Text>
            <Text style={styles.ruleChip}>{t.notifications.calendarStart}</Text>
            <Text style={styles.ruleChip}>{t.notifications.task30}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: isRTL ? "flex-end" : "flex-start",
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 28,
  },
  hero: {
    gap: 10,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  statusSection: {
    gap: 18,
  },
  statusTop: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 14,
    alignItems: "center",
  },
  statusCopy: {
    flex: 1,
    alignItems: isRTL ? "flex-end" : "flex-start",
    gap: 3,
  },
  statusTitle: {
    color: colors.textPrimary,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  statusBody: {
    textAlign: isRTL ? "right" : "left",
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: colors.background,
    fontWeight: "800",
    textAlign: "center",
  },
  rulesSection: {
    gap: 10,
  },
  rulesTitle: {
    color: colors.textPrimary,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  ruleChips: {
    flexDirection: isRTL ? "row-reverse" : "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ruleChip: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 11,
    fontWeight: "800",
  },
});
