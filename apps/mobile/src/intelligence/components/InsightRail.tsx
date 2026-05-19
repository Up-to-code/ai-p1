import { ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { Sparkles } from "lucide-react-native";

import { Surface } from "@/foundation/primitives/Surface";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import type { InsightCard } from "@/types/domain";

type InsightRailProps = {
  insights: InsightCard[];
};

export function InsightRail({ insights }: InsightRailProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="label" tone="secondary">
          AI insight rail
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {insights.map((insight) => (
          <Surface key={insight.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Sparkles size={16} color={insight.tone === "signal" ? colors.accent : colors.textSecondary} />
            </View>
            <Text variant="label">{insight.title}</Text>
            <Text tone="secondary" style={styles.body}>
              {insight.body}
            </Text>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  card: {
    width: 272,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    lineHeight: 20,
  },
});
