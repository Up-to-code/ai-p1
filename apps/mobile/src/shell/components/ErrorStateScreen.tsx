import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  LifeBuoy,
  RotateCcw,
} from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

export type ErrorStateAction = {
  label: string;
  kind?: "primary" | "secondary" | "ghost";
  onPress?: () => void;
};

type ErrorStateScreenProps = {
  eyebrow: string;
  code: string;
  title: string;
  body: string;
  technicalNote?: string;
  signal?: string;
  Icon?: any;
  actions?: ErrorStateAction[];
};

export function ErrorStateScreen({
  eyebrow,
  code,
  title,
  body,
  technicalNote,
  signal = "ZaneAI is holding the workspace steady.",
  Icon = AlertTriangle,
  actions,
}: ErrorStateScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const resolvedActions = actions ?? [
    {
      label: "Try again",
      onPress: () => router.replace("/(app)"),
    },
    {
      label: "Go home",
      kind: "secondary" as const,
      onPress: () => router.replace("/(app)"),
    },
  ];

  return (
    <Screen safe={false}>
      <View style={[styles.topBar, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text variant="caption" tone="muted" style={styles.topLabel}>
          SYSTEM STATE
        </Text>
        <Pressable accessibilityLabel="Home" onPress={() => router.replace("/(app)")} style={styles.backButton}>
          <Home size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 92,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.springify()} style={styles.hero}>
          <View style={styles.orbit}>
            <View style={styles.iconShell}>
              <Icon size={42} color={colors.accent} strokeWidth={1.8} />
            </View>
            <View style={styles.scanLine} />
          </View>

          <Text variant="caption" tone="muted" style={styles.eyebrow}>
            {eyebrow}
          </Text>
          <Text style={styles.code}>{code}</Text>
          <Text variant="display" style={styles.title}>
            {title}
          </Text>
          <Text tone="secondary" style={styles.body}>
            {body}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.statusPanel}>
          <View style={styles.statusHeader}>
            <View style={styles.liveDot} />
            <Text variant="label" style={styles.statusTitle}>
              Recovery signal
            </Text>
          </View>
          <Text tone="secondary" style={styles.statusCopy}>
            {signal}
          </Text>
          {technicalNote ? (
            <View style={styles.note}>
              <LifeBuoy size={16} color={colors.textMuted} />
              <Text variant="caption" tone="muted" style={styles.noteText}>
                {technicalNote}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()} style={styles.actions}>
          {resolvedActions.map((action) => {
            const isPrimary = action.kind !== "secondary";
            const labelColor = isPrimary ? colors.background : colors.textPrimary;
            return (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                onPress={action.onPress}
                style={({ pressed }) => [
                  styles.actionButton,
                  isPrimary ? styles.primaryAction : styles.secondaryAction,
                  pressed && styles.pressedAction,
                ]}
              >
                {action.label.toLowerCase().includes("try") ? (
                  <RotateCcw size={16} color={labelColor} />
                ) : null}
                <Text variant="label" style={[styles.actionLabel, { color: labelColor }]}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    topBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      backgroundColor: `${colors.background}F7`,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    topLabel: {
      letterSpacing: 2.4,
      textAlign: "center",
      fontFamily: "Manrope_800ExtraBold",
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    hero: {
      alignItems: "center",
      gap: theme.spacing.md,
    },
    orbit: {
      width: 168,
      height: 168,
      borderRadius: 84,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.divider,
      backgroundColor: "transparent",
    },
    iconShell: {
      width: 86,
      height: 86,
      borderRadius: 43,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    scanLine: {
      position: "absolute",
      left: 28,
      right: 28,
      height: 1,
      backgroundColor: colors.divider,
    },
    eyebrow: {
      letterSpacing: 2.8,
      textTransform: "uppercase",
      fontFamily: "Manrope_800ExtraBold",
      color: colors.textMuted,
    },
    code: {
      color: colors.textMuted,
      fontSize: 56,
      lineHeight: 62,
      fontFamily: "Manrope_700Bold",
      letterSpacing: 0,
      textAlign: "center",
    },
    title: {
      maxWidth: 320,
      textAlign: "center",
      letterSpacing: -0.3,
      fontFamily: "Manrope_800ExtraBold",
    },
    body: {
      maxWidth: 316,
      textAlign: "center",
      lineHeight: 22,
    },
    statusPanel: {
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    statusHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textPrimary,
    },
    statusTitle: {
      color: colors.textPrimary,
      fontFamily: "Manrope_800ExtraBold",
    },
    statusCopy: {
      lineHeight: 22,
    },
    note: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
    },
    noteText: {
      flex: 1,
      lineHeight: 18,
    },
    actions: {
      gap: theme.spacing.md,
    },
    actionButton: {
      width: "100%",
      minHeight: 48,
      borderRadius: theme.radii.pill,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
    },
    primaryAction: {
      backgroundColor: colors.textPrimary,
    },
    secondaryAction: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.divider,
    },
    pressedAction: {
      opacity: 0.88,
    },
    actionLabel: {
      color: colors.textPrimary,
      fontFamily: "Manrope_800ExtraBold",
    },
  });
