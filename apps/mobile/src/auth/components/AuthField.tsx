import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { type LucideIcon } from "lucide-react-native";

import { useAppLocalization } from "@/foundation/localization";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type AuthFieldProps = TextInputProps & {
  label: string;
  icon?: LucideIcon;
};

export function AuthField({ label, icon: Icon, style, ...props }: AuthFieldProps) {
  const { colors } = useTheme();
  const { isRTL } = useAppLocalization();

  return (
    <View style={styles.container}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <View
        style={[
          styles.field,
          isRTL && styles.fieldRtl,
          {
            backgroundColor: colors.background,
            borderColor: colors.divider,
          },
        ]}
      >
        {Icon ? <Icon color={colors.textSecondary} size={18} /> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          style={[styles.input, isRTL && styles.inputRtl, { color: colors.textPrimary }, style]}
          textAlign={isRTL ? "right" : "left"}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  field: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Manrope_500Medium",
    paddingVertical: theme.spacing.md,
  },
  fieldRtl: {
    flexDirection: "row-reverse",
  },
  inputRtl: {
    writingDirection: "rtl",
  },
});
