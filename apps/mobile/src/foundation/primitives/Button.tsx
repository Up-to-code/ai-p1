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
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useSystemUI } from "@/foundation/system/useSystemUI";

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
  const { sizes } = useSystemUI();
  const styles = useMemo(() => createStyles(colors, sizes.auth), [colors, sizes.auth]);

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
        numberOfLines={2}
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

const createStyles = (colors: AppColors, authSizes: ReturnType<typeof useSystemUI>["sizes"]["auth"]) => StyleSheet.create({
  base: {
    minHeight: authSizes.buttonHeight,
    borderRadius: theme.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: authSizes.buttonHorizontalPadding,
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
    fontSize: authSizes.buttonFontSize,
    lineHeight: authSizes.buttonLineHeight,
    flexShrink: 1,
    minWidth: 0,
    textAlign: "center",
  },
  primaryLabel: {
    color: "#FFFFFF",
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
  leading: {
    marginRight: theme.spacing.xs,
    flexShrink: 0,
  },
  trailing: {
    marginLeft: theme.spacing.xs,
    flexShrink: 0,
  },
  rtl: {
    flexDirection: "row-reverse",
  },
});
