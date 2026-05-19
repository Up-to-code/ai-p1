import { Pressable, StyleSheet, View } from "react-native";
import { AlertCircle, Info, RefreshCw } from "lucide-react-native";

import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type PropertyStateCardProps = {
  title: string;
  body: string;
  tone?: "neutral" | "error";
  actionLabel?: string;
  onPressAction?: () => void;
};

export function PropertyStateCard({
  title,
  body,
  tone = "neutral",
  actionLabel,
  onPressAction,
}: PropertyStateCardProps) {
  const { colors } = useTheme();
  const Icon = tone === "error" ? AlertCircle : Info;
  const iconColor = tone === "error" ? "#EF4444" : colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}14` }]}>
        <Icon size={22} color={iconColor} />
      </View>
      <Text variant="title" style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text variant="body" style={[styles.body, { color: colors.textMuted }]}>
        {body}
      </Text>
      {actionLabel && onPressAction ? (
        <Pressable style={[styles.action, { backgroundColor: colors.accent }]} onPress={onPressAction}>
          <RefreshCw size={14} color="#FFFFFF" />
          <Text variant="label" style={styles.actionLabel}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    maxWidth: 280,
  },
  action: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionLabel: {
    color: "#FFFFFF",
  },
});

