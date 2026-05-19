import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  showCopy?: boolean;
};

export function ScreenHeader({ eyebrow, title, subtitle, showCopy = true }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets);

  if (!showCopy) return null;

  return (
    <View style={styles.container}>
      <View style={styles.copyBlock}>
        <Text variant="caption" tone="muted" style={styles.eyebrow}>
          {eyebrow}
        </Text>
        <Text variant="title" style={styles.title}>
          {title}
        </Text>
        <Text tone="secondary" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any, insets: any) => StyleSheet.create({
  container: { paddingHorizontal: theme.spacing.lg, paddingTop: insets.top + theme.spacing.md, paddingBottom: theme.spacing.md },
  copyBlock: { gap: theme.spacing.xs },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 2.2, // Elite tracking
  },
  title: {
    maxWidth: 280,
    letterSpacing: -0.6,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 20,
  },
});
