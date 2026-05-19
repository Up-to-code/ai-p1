import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocalization } from "@/foundation/localization";
import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { errorStates } from "@/shell/errorStates";

export default function ErrorStatesIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable accessibilityLabel={t.common.back} onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.textPrimary} style={mirrorIcon(isRTL)} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text variant="caption" tone="muted" style={styles.eyebrow}>
            {t.errorList.listEyebrow}
          </Text>
          <Text variant="title" style={styles.title}>
            {t.errorList.listTitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 112,
            paddingBottom: insets.bottom + theme.spacing.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text tone="secondary" style={styles.intro}>
          {t.errorList.listBody}
        </Text>

        <View style={styles.list}>
          {errorStates.map((state, index) => {
            const Icon = state.Icon;
            return (
              <Animated.View key={state.kind} entering={FadeInDown.delay(index * 60).springify()}>
                <Pressable style={styles.row} onPress={() => router.push(state.route)}>
                  <View style={styles.iconBox}>
                    <Icon size={21} color={colors.accent} strokeWidth={1.8} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text variant="label" style={styles.rowTitle}>
                      {state.menuLabel}
                    </Text>
                    <Text variant="caption" tone="muted" numberOfLines={2} style={styles.rowBody}>
                      {state.title}
                    </Text>
                  </View>
                  <Text variant="caption" tone="muted" style={styles.code}>
                    {state.code}
                  </Text>
                  <ChevronRight size={16} color={colors.textMuted} style={mirrorIcon(isRTL)} />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: any, isRTL: boolean) =>
  StyleSheet.create({
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      backgroundColor: `${colors.background}F7`,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
    },
      headerCopy: {
        flex: 1,
        gap: 2,
        alignItems: isRTL ? "flex-end" : "flex-start",
      },
    eyebrow: {
      letterSpacing: 2.2,
    },
    title: {
      letterSpacing: 0,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.xl,
    },
    intro: {
      maxWidth: 330,
      lineHeight: 22,
    },
    list: {
      gap: theme.spacing.md,
    },
    row: {
      minHeight: 86,
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: colors.surfaceRaised,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.divider,
    },
    iconBox: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.accent}12`,
    },
    rowCopy: {
      flex: 1,
      gap: 3,
    },
    rowTitle: {
      color: colors.textPrimary,
    },
    rowBody: {
      lineHeight: 18,
    },
    code: {
      minWidth: 34,
      textAlign: "right",
      fontFamily: "Manrope_700Bold",
    },
  });
