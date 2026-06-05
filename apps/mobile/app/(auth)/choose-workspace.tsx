import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Building2, CheckCircle2, Loader2, LogOut, Plus } from "lucide-react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";

import { Button } from "@/foundation/primitives/Button";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { WorkspaceAccessRow, WorkspaceAccessSurface } from "@/auth/components/WorkspaceAccessSurface";
import { shouldResetThreadForOrganizationSwitch } from "@/auth/workspaceAccess";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { signOutForAccountSwitch } from "@/auth/signOut";
import { useAppStore } from "@/store";

type Choice = "create" | null;

export default function ChooseWorkspaceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const workspace = useWorkspaceAccess();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const [choice, setChoice] = useState<Choice>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "">("");
  const [error, setError] = useState("");
  const resetConversationState = useAppStore((state) => state.resetConversationState);

  const selectOrganization = async (organizationId: string) => {
    setBusyId(organizationId);
    setError("");
    try {
      await workspace.selectOrganization(organizationId);
      if (shouldResetThreadForOrganizationSwitch(workspace.organizationId, organizationId)) {
        resetConversationState();
      }
      router.replace("/(app)");
    } catch (error) {
      setError(error instanceof Error ? error.message : t.workspaceAccess.errorBody);
    } finally {
      setBusyId("");
    }
  };

  const createOrganization = async () => {
    const name = organizationName.trim();
    if (!name) {
      setError(t.workspaceAccess.nameRequired);
      return;
    }

    setBusyAction("create");
    setError("");
    try {
      await workspace.createOrganization({ name, type: "broker" });
      resetConversationState();
      router.replace("/(app)");
    } catch (error) {
      setError(error instanceof Error ? error.message : t.workspaceAccess.errorBody);
    } finally {
      setBusyAction("");
    }
  };

  const handleUseAnotherAccount = async () => {
    await signOutForAccountSwitch();
    router.replace("/(auth)");
  };

  const activeOrganization = workspace.activeOrganization;
  const actionDisabled = Boolean(busyId || busyAction || workspace.isPending);

  return (
    <WorkspaceAccessSurface
      eyebrow={t.workspaceAccess.eyebrow}
      title={t.workspaceAccess.title}
      body={t.workspaceAccess.body}
      showTopBar={false}
      cardPresentation="cards"
      footer={(
        <View style={styles.footerActions}>
          {activeOrganization?.id ? (
            <Button
              testID="workspace.continue"
              label={t.workspaceAccess.continueWorkspace}
              trailing={<ArrowRight size={16} color={colors.background} style={mirrorIcon(isRTL)} />}
              onPress={() => router.replace("/(app)")}
              style={styles.primaryAction}
              textStyle={styles.primaryActionText}
            />
          ) : null}
          {workspace.isAuthenticated ? (
            <Button
              testID="workspace.use_another_account"
              variant="ghost"
              label={t.workspaceAccess.useAnotherAccount}
              leading={<LogOut size={16} color={colors.textSecondary} style={mirrorIcon(isRTL)} />}
              onPress={() => void handleUseAnotherAccount()}
              textStyle={styles.footerGhostText}
            />
          ) : null}
        </View>
      )}
    >
      {workspace.isPending ? (
        <Animated.View entering={FadeInDown.duration(140)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)} style={styles.loadingRow}>
          <Loader2 size={18} color={colors.textMuted} />
          <Text tone="secondary">{t.workspaceAccess.loading}</Text>
        </Animated.View>
      ) : null}

      {workspace.error && !error ? (
        <Animated.View entering={FadeInDown.duration(140)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)} style={styles.errorRow}>
          <Text style={styles.errorText}>{workspace.error}</Text>
        </Animated.View>
      ) : null}

      {error ? (
        <Animated.View entering={FadeInDown.duration(140)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)} style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      ) : null}

      <Animated.View layout={LinearTransition.duration(180)} style={styles.cardStack}>
        {workspace.organizations.length > 0 ? (
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>{t.workspaceAccess.yourWorkspaces}</Text>
            <View style={styles.cardStack}>
              {workspace.organizations.map((organization, index) => (
                <Animated.View key={organization.id} entering={FadeInDown.delay(index * 30).duration(160)} layout={LinearTransition.duration(180)}>
                  <WorkspaceAccessRow
                    card
                    testID={`workspace.option.${organization.id}`}
                    icon={busyId === organization.id ? <CheckCircle2 size={20} color={colors.textPrimary} /> : <Building2 size={20} color={colors.textPrimary} />}
                    title={organization.name ?? t.workspaceAccess.untitledWorkspace}
                    meta={organization.slug ?? organization.id}
                    disabled={actionDisabled}
                    onPress={() => void selectOrganization(organization.id)}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>{t.workspaceAccess.setupAccess}</Text>
          <View style={styles.cardStack}>
            <WorkspaceAccessRow
              card
              testID="workspace.create"
              icon={<Plus size={20} color={colors.textPrimary} />}
              title={t.workspaceAccess.createTitle}
              body={t.workspaceAccess.createBody}
              selected={choice === "create"}
              disabled={actionDisabled}
              onPress={() => setChoice(choice === "create" ? null : "create")}
            />
            {choice === "create" ? (
              <Animated.View entering={FadeInDown.duration(160)} exiting={FadeOut.duration(100)} layout={LinearTransition.duration(180)} style={styles.inlinePanel}>
                <View style={styles.field}>
                  <Building2 size={18} color={colors.textMuted} />
                  <TextInput
                    testID="workspace.name_input"
                    value={organizationName}
                    onChangeText={(value) => {
                      setOrganizationName(value);
                      setError("");
                    }}
                    placeholder={t.workspaceAccess.namePlaceholder}
                    placeholderTextColor={colors.textMuted}
                    editable={!actionDisabled}
                    selectionColor={colors.textPrimary}
                    style={[styles.input, isRTL && styles.inputRtl]}
                    textAlign={isRTL ? "right" : "left"}
                  />
                </View>
                <Button
                  testID="workspace.create_submit"
                  label={busyAction === "create" ? t.common.loading : t.workspaceAccess.createButton}
                  trailing={<ArrowRight size={16} color={colors.background} style={mirrorIcon(isRTL)} />}
                  onPress={() => void createOrganization()}
                  disabled={actionDisabled}
                  style={styles.primaryAction}
                  textStyle={styles.primaryActionText}
                />
              </Animated.View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </WorkspaceAccessSurface>
  );
}

const createStyles = (colors: AppColors, isRTL: boolean) => StyleSheet.create({
  loadingRow: {
    minHeight: 72,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  errorRow: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Manrope_600SemiBold",
    textAlign: isRTL ? "right" : "left",
  },
  inlinePanel: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderRadius: 18,
    borderBottomWidth: 1,
    borderColor: colors.divider,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  cardStack: {
    gap: theme.spacing.sm,
  },
  sectionBlock: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: theme.spacing.xs,
    textTransform: "uppercase",
  },
  field: {
    minHeight: 52,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 18,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Manrope_500Medium",
    paddingVertical: theme.spacing.md,
  },
  inputRtl: {
    writingDirection: "rtl",
  },
  footerActions: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  primaryAction: {
    width: "100%",
    backgroundColor: colors.textPrimary,
  },
  primaryActionText: {
    color: colors.background,
  },
  footerGhostText: {
    color: colors.textSecondary,
  },
  rtlText: {
    textAlign: "right",
  },
});
