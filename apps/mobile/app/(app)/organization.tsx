import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Link, RefreshCw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { workspaceOrganizationLabel } from "@/auth/workspaceAccess";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";

export default function OrganizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL, locale } = useAppLocalization();
  const workspace = useWorkspaceAccess();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const activeWorkspaceName = workspaceOrganizationLabel(
    workspace.activeOrganization,
    t.workspaceAccess.untitledWorkspace,
  );

  const handleCreateInviteLink = async () => {
    if (!workspace.organizationId) {
      router.push("/(auth)/choose-workspace" as never);
      return;
    }

    try {
      const invite = await workspace.createInviteLink({
        organizationId: workspace.organizationId,
        role: "member",
        locale,
      });
      if (invite.inviteUrl) {
        await Clipboard.setStringAsync(invite.inviteUrl);
      }
      Alert.alert(t.workspaceAccess.inviteLinkCreated, t.workspaceAccess.inviteLinkCopied);
    } catch (error) {
      Alert.alert(
        t.workspaceAccess.errorTitle,
        error instanceof Error ? error.message : t.workspaceAccess.errorBody,
      );
    }
  };

  return (
    <Screen safe={false}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
        <Pressable accessibilityLabel={t.common.back} style={styles.headerButton} onPress={() => router.back()}>
          <BackIcon size={24} color={colors.textPrimary} strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 84, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text variant="caption" tone="muted" style={styles.eyebrow}>{t.workspaceAccess.eyebrow}</Text>
          <Text variant="display" style={styles.title}>{t.workspaceAccess.organizationSettingsTitle}</Text>
          <Text tone="secondary" style={styles.body}>{activeWorkspaceName}</Text>
        </View>

        <View style={styles.card}>
          <ActionRow
            testID="organization.active"
            icon={<BriefcaseBusiness size={18} color={colors.textPrimary} />}
            title={t.workspaceAccess.activeWorkspace}
            description={activeWorkspaceName}
            colors={colors}
            isRTL={isRTL}
          />
          <View style={styles.divider} />
          <ActionRow
            testID="organization.invite"
            icon={<Link size={18} color={colors.textPrimary} />}
            title={t.workspaceAccess.createInviteLink}
            description={t.workspaceAccess.organizationSettingsBody}
            colors={colors}
            isRTL={isRTL}
            onPress={() => void handleCreateInviteLink()}
          />
          <View style={styles.divider} />
          <ActionRow
            testID="organization.switch"
            icon={<RefreshCw size={18} color={colors.textPrimary} />}
            title={t.workspaceAccess.switchWorkspace}
            description={t.workspaceAccess.yourWorkspaces}
            colors={colors}
            isRTL={isRTL}
            onPress={() => router.push("/(auth)/choose-workspace" as never)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ActionRow({
  testID,
  icon,
  title,
  description,
  colors,
  isRTL,
  onPress,
}: {
  testID: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  colors: AppColors;
  isRTL: boolean;
  onPress?: () => void;
}) {
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  return (
    <Pressable testID={testID} disabled={!onPress} style={styles.row} onPress={onPress}>
      <View style={styles.rowMain}>
        <View style={styles.iconBox}>{icon}</View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          {description ? <Text tone="muted" style={styles.rowDescription}>{description}</Text> : null}
        </View>
      </View>
      {onPress ? <ChevronRight size={14} color={colors.textMuted} style={mirrorIcon(isRTL)} /> : null}
    </Pressable>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  header: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: theme.spacing.lg,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  hero: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: isRTL ? "right" : "left",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  row: {
    minHeight: 72,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  rowMain: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  rowDescription: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: isRTL ? "right" : "left",
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: theme.spacing.lg,
  },
});
