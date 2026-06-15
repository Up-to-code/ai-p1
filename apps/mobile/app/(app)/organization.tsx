import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { BriefcaseBusiness, CheckCircle2, ChevronLeft, ChevronRight, Link } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { shouldResetThreadForOrganizationSwitch, workspaceOrganizationLabel } from "@/auth/workspaceAccess";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { useAppStore } from "@/store";
import { useOrganizationProfile } from "@/persistence/api/conversationData";

export default function OrganizationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, isRTL, locale } = useAppLocalization();
  const workspace = useWorkspaceAccess();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;
  const [busyId, setBusyId] = useState("");
  const resetConversationState = useAppStore((state) => state.resetConversationState);
  const profile = useOrganizationProfile();
  const activeWorkspaceName = profile?.name?.trim()
    || workspaceOrganizationLabel(
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

  const selectOrganization = async (organizationId: string) => {
    if (organizationId === workspace.organizationId || busyId) return;
    setBusyId(organizationId);
    try {
      await workspace.selectOrganization(organizationId);
      if (shouldResetThreadForOrganizationSwitch(workspace.organizationId, organizationId)) {
        resetConversationState();
      }
      router.replace("/(app)");
    } catch (error) {
      Alert.alert(t.workspaceAccess.errorTitle, error instanceof Error ? error.message : t.workspaceAccess.errorBody);
    } finally {
      setBusyId("");
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
          <Text variant="display" style={styles.title}>{t.workspaceAccess.organizationSettingsTitle}</Text>
          <Text tone="secondary" style={styles.body}>{activeWorkspaceName}</Text>
        </View>

        <View style={styles.list}>
          <ActionRow
            testID="organization.active"
            icon={<BriefcaseBusiness size={24} color={colors.textPrimary} />}
            title={t.workspaceAccess.activeWorkspace}
            description={activeWorkspaceName}
            colors={colors}
            isRTL={isRTL}
          />
          <ActionRow
            testID="organization.invite"
            icon={<Link size={24} color={colors.textPrimary} />}
            title={t.workspaceAccess.createInviteLink}
            description={t.workspaceAccess.organizationSettingsBody}
            colors={colors}
            isRTL={isRTL}
            onPress={() => void handleCreateInviteLink()}
          />
        </View>

        <View style={styles.section}>
          <Text variant="caption" tone="muted" style={styles.sectionLabel}>{t.workspaceAccess.yourWorkspaces}</Text>
          <View style={styles.list}>
            {workspace.organizations.map((organization) => {
              const selected = organization.id === workspace.organizationId;
              return (
                <ActionRow
                  key={organization.id}
                  testID={`organization.switch.${organization.id}`}
                  icon={selected ? <CheckCircle2 size={24} color={colors.accent} /> : <BriefcaseBusiness size={24} color={colors.textPrimary} />}
                  title={organization.name ?? t.workspaceAccess.untitledWorkspace}
                  description={organization.slug ?? organization.id}
                  badge={selected ? t.workspaceAccess.activeBadge : undefined}
                  colors={colors}
                  isRTL={isRTL}
                  onPress={selected ? undefined : () => void selectOrganization(organization.id)}
                />
              );
            })}
          </View>
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
  badge,
  colors,
  isRTL,
  onPress,
}: {
  testID: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
  colors: AppColors;
  isRTL: boolean;
  onPress?: () => void;
}) {
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  return (
    <Pressable testID={testID} disabled={!onPress} style={styles.row} onPress={onPress}>
      <View style={styles.rowMain}>
        <View style={styles.iconSlot}>{icon}</View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          {description ? <Text tone="muted" style={styles.rowDescription}>{description}</Text> : null}
        </View>
        {badge ? <Text tone="muted" style={styles.badge}>{badge}</Text> : null}
      </View>
      {onPress ? <ChevronRight size={16} color={colors.textMuted} style={mirrorIcon(isRTL)} /> : null}
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
    paddingBottom: theme.spacing.sm,
    alignItems: isRTL ? "flex-end" : "flex-start",
    backgroundColor: colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  hero: {
    gap: 2,
    marginBottom: 30,
    alignItems: isRTL ? "flex-end" : "flex-start",
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: isRTL ? "right" : "left",
  },
  list: {
    gap: 12,
  },
  section: {
    marginTop: 34,
    gap: 10,
  },
  sectionLabel: {
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "800",
  },
  row: {
    minHeight: 68,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  rowMain: {
    flex: 1,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  iconSlot: {
    width: 36,
    height: 44,
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
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    textAlign: isRTL ? "right" : "left",
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: isRTL ? "right" : "left",
  },
  badge: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Manrope_600SemiBold",
    color: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: `${colors.accent}18`,
    textAlign: isRTL ? "right" : "left",
  },
});
