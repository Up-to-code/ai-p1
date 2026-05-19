import { Text as RNText, StyleSheet, type TextProps as RNTextProps, type TextStyle } from "react-native";
import React, { Children, isValidElement, useMemo, type ReactNode } from "react";

import { useAppLocalization } from "@/foundation/localization";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { isArabic } from "@/foundation/utils/rtl";

type Variant = "display" | "title" | "body" | "label" | "caption";
type Tone = "primary" | "secondary" | "muted" | "accent";

type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
  selectable?: boolean;
};

export const Text = React.forwardRef<RNText, TextProps>(
  ({ style, variant = "body", tone = "primary", selectable, children, ...props }, ref) => {
    const { colors } = useTheme();
    const { isRTL } = useAppLocalization();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const arabic = useMemo(() => isArabic(extractTextContent(children)), [children]);
    const shouldUseArabicTypography = isRTL || arabic;
    const flattenedStyle = useMemo(() => StyleSheet.flatten(style) as TextStyle | undefined, [style]);

    const arabicStyle = useMemo(() => {
      if (!shouldUseArabicTypography) return null;
      const arabicFontFamilyByVariant: Record<Variant, string> = {
        display: "Cairo_700Bold",
        title: "Cairo_700Bold",
        body: "Cairo_400Regular",
        label: "Cairo_600SemiBold",
        caption: "Cairo_400Regular",
      };
      return {
        fontFamily: arabicFontFamilyByVariant[variant],
        textAlign: flattenedStyle?.textAlign ?? ("right" as const),
        writingDirection: flattenedStyle?.writingDirection ?? ("rtl" as const),
      };
    }, [flattenedStyle?.textAlign, flattenedStyle?.writingDirection, shouldUseArabicTypography, variant]);

    return (
      <RNText
        ref={ref}
        selectable={selectable}
        style={[styles.base, styles[variant], styles[tone], style, arabicStyle]}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = "Text";

function extractTextContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!node) {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map((child) => extractTextContent(child)).join("");
  }
  if (isValidElement(node)) {
    return extractTextContent((node.props as { children?: ReactNode }).children);
  }
  return Children.toArray(node).map((child) => extractTextContent(child)).join("");
}

const createStyles = (colors: any) => StyleSheet.create({
  base: {
    color: colors.textPrimary,
    fontFamily: "Manrope_500Medium",
  },
  display: theme.typography.display,
  title: theme.typography.title,
  body: theme.typography.body,
  label: theme.typography.label,
  caption: theme.typography.caption,
  primary: {
    color: colors.textPrimary,
  },
  secondary: {
    color: colors.textSecondary,
  },
  muted: {
    color: colors.textMuted,
  },
  accent: {
    color: colors.accent,
  },
});
