import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useMemo, type ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

type WorkspaceAccessSurfaceProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  onBack?: () => void;
  showTopBar?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

type WorkspaceAccessRowProps = {
  testID?: string;
  icon: ReactNode;
  title: string;
  body?: string;
  meta?: string;
  selected?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
};

export function WorkspaceAccessSurface({
  eyebrow,
  title,
  body,
  onBack,
  showTopBar = true,
  children,
  footer,
  contentStyle,
}: WorkspaceAccessSurfaceProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isRTL, t } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);

  return (
    <View style={styles.screen}>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing.xl, paddingBottom: insets.bottom + theme.spacing.xxl },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showTopBar ? (
          <View style={styles.topBar}>
            {onBack ? (
              <Pressable accessibilityLabel={t.common.back} onPress={onBack} style={styles.backButton}>
                <ArrowLeft size={19} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
              </Pressable>
            ) : (
              <View style={styles.brandDot} />
            )}
            <Text style={styles.brandText}>qentrah</Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text variant="display" style={styles.title}>{title}</Text>
          {body ? <Text tone="secondary" style={styles.body}>{body}</Text> : null}
        </View>

        <View style={styles.card}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </View>
  );
}

export function WorkspaceAccessRow({
  testID,
  icon,
  title,
  body,
  meta,
  selected,
  disabled,
  trailing,
  onPress,
}: WorkspaceAccessRowProps) {
  const { colors } = useTheme();
  const { isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);

  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && !disabled ? styles.rowPressed : null,
        disabled ? styles.rowDisabled : null,
      ]}
    >
      <View style={[styles.rowIcon, selected && styles.rowIconSelected]}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {body ? <Text tone="secondary" style={styles.rowBody} numberOfLines={2}>{body}</Text> : null}
        {meta ? <Text tone="muted" style={styles.rowMeta} numberOfLines={1}>{meta}</Text> : null}
      </View>
      {trailing ?? <ChevronRight size={16} color={colors.textMuted} style={mirrorIcon(isRTL)} />}
    </Pressable>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  topBar: {
    minHeight: 44,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  brandText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0,
  },
  hero: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Manrope_800ExtraBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: isRTL ? "right" : "left",
  },
  body: {
    maxWidth: 340,
    fontSize: 14,
    lineHeight: 21,
    textAlign: isRTL ? "right" : "left",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  footer: {
    paddingTop: theme.spacing.lg,
    alignItems: "center",
    width: "100%",
  },
  row: {
    minHeight: 68,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.78,
  },
  rowSelected: {
    backgroundColor: colors.backgroundSoft,
  },
  rowDisabled: {
    opacity: 0.56,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
  },
  rowIconSelected: {
    borderColor: colors.accent,
  },
  rowText: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: isRTL ? "right" : "left",
  },
  rowBody: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: isRTL ? "right" : "left",
  },
  rowMeta: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Manrope_700Bold",
    textAlign: isRTL ? "right" : "left",
  },
});
