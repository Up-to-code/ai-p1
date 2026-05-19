import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import type { AssistantStageEvent, ThreadPresentation } from "@/conversation/assistantProtocol";
import { AssistantBrandMark } from "@/conversation/components/AssistantBrandMark";
import {
  resolveAssistantBrandActivity,
  resolveAssistantDirection,
  resolveThreadPresentationState,
} from "@/conversation/lib/assistantPresentation";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type AssistantStageProgressProps = {
  events: AssistantStageEvent[];
  threadPresentation?: ThreadPresentation | null;
};

export function AssistantStageProgress({ events, threadPresentation }: AssistantStageProgressProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const latest = [...events]
    .reverse()
    .find((event) => Boolean(event.route || event.specialist));

  if (!latest) {
    return null;
  }

  const tone = latest.motionPreset ?? "assistant";
  const resolvedThreadPresentation = resolveThreadPresentationState(threadPresentation);
  const direction = resolveAssistantDirection({
    threadPresentation: resolvedThreadPresentation,
    fallbackText: latest.message,
  });
  const brandActivity = resolveAssistantBrandActivity({
    threadPresentation: resolvedThreadPresentation,
    route: latest.route,
    stageSpecialist: latest.specialist,
    phase: latest.phase,
    stageStatus: latest.status,
  });

  return (
    <View style={[styles.container, styles[`container_${tone}`]]}>
      <View style={styles.headerRow}>
        <AssistantBrandMark
          direction={direction}
          label={brandActivity.label}
          animate={brandActivity.logoMotion}
          textMotion={brandActivity.textMotion}
          emphasis={brandActivity.emphasis}
          size={14}
        />
      </View>
      <Text style={styles.message}>{latest.message}</Text>
      <Text style={styles.meta}>
        {latest.specialist ?? "orchestrator"}
        {" • "}
        {latest.phase.replaceAll("_", " ")}
      </Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    container_assistant: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    container_advisor: {
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    container_property: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceRaised,
    },
    container_funding: {
      borderColor: colors.border,
      backgroundColor: colors.backgroundSoft,
    },
    headerRow: {
      alignItems: "flex-start",
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Manrope_600SemiBold",
      color: colors.textPrimary,
    },
    meta: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: "Manrope_500Medium",
    },
  });
