import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useMemo, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/foundation/primitives/Text";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { useAppLocalization } from "@/foundation/localization";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

type WorkspaceAccessSurfaceProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  onBack?: () => void;
  showTopBar?: boolean;
  cardPresentation?: "grouped" | "cards";
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

type WorkspaceAccessRowProps = {
  card?: boolean;
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
  cardPresentation = "grouped",
  children,
  footer,
  contentStyle,
}: WorkspaceAccessSurfaceProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isRTL, t } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <View style={styles.screen}>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + theme.spacing.md, paddingBottom: insets.bottom + theme.spacing.xxl },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showTopBar ? (
          <View style={styles.topBar}>
            {onBack ? (
              <Pressable accessibilityLabel={t.common.back} onPress={onBack} style={styles.backButton}>
                <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
              </Pressable>
            ) : (
              <View style={styles.brandDot} />
            )}
          </View>
        ) : null}

        <View style={styles.hero}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text variant="display" style={styles.title}>{title}</Text>
          {body ? <Text tone="secondary" style={styles.body}>{body}</Text> : null}
        </View>

        <View style={cardPresentation === "cards" ? styles.cardList : styles.plainList}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </View>
  );
}

export function WorkspaceAccessRow({
  card,
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
        card && styles.rowCard,
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

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  topBar: {
    minHeight: 40,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textPrimary,
  },
  hero: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  eyebrow: {
    color: colors.textMuted,
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
    fontSize: 15,
    lineHeight: 22,
    textAlign: isRTL ? "right" : "left",
  },
  plainList: {
    gap: theme.spacing.sm,
  },
  cardList: {
    gap: theme.spacing.sm,
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
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.md,
  },
  rowCard: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.78,
  },
  rowSelected: {
    opacity: 1,
  },
  rowDisabled: {
    opacity: 0.56,
  },
  rowIcon: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconSelected: {
    opacity: 1,
  },
  rowText: {
    flex: 1,
    gap: 2,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 21,
    lineHeight: 28,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: isRTL ? "right" : "left",
  },
  rowBody: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_500Medium",
    textAlign: isRTL ? "right" : "left",
  },
  rowMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_500Medium",
    textAlign: isRTL ? "right" : "left",
  },
});
