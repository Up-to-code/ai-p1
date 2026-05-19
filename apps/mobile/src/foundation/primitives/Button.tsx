import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useMemo, type ReactNode } from "react";

import { useAppLocalization } from "@/foundation/localization";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";

type ButtonProps = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  leading?: ReactNode;
  trailing?: ReactNode;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({ 
  label, 
  variant = "primary", 
  style, 
  leading,
  trailing, 
  textStyle,
  ...props 
}: ButtonProps) {
  const { colors } = useTheme();
  const { isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={(state) => [
        styles.base,
        styles[variant],
        isRTL && styles.rtl,
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text 
        variant="label" 
        style={[
          styles.label, 
          variant === "primary" ? styles.primaryLabel : styles.secondaryLabel,
          textStyle
        ]}
      >
        {label}
      </Text>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    fontFamily: "Manrope_800ExtraBold",
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
  leading: {
    marginRight: theme.spacing.xs,
  },
  trailing: {
    marginLeft: theme.spacing.xs,
  },
  rtl: {
    flexDirection: "row-reverse",
  },
});
