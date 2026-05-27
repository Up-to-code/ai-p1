import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight, Building2, CheckCircle2, Link2, Loader2, LogOut, Plus, Users } from "lucide-react-native";

import { Button } from "@/foundation/primitives/Button";
import { Text } from "@/foundation/primitives/Text";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { WorkspaceAccessRow, WorkspaceAccessSurface } from "@/auth/components/WorkspaceAccessSurface";
import { parseInviteInput } from "@/auth/workspaceAccess";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { mirrorIcon } from "@/foundation/utils/layoutDirection";
import { signOutForAccountSwitch } from "@/auth/signOut";

type Choice = "join" | "create" | null;

export default function ChooseWorkspaceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL } = useAppLocalization();
  const workspace = useWorkspaceAccess();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const [choice, setChoice] = useState<Choice>(null);
  const [inviteValue, setInviteValue] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState<"broker" | "developer">("broker");
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "join" | "">("");

  const selectOrganization = async (organizationId: string) => {
    setBusyId(organizationId);
    try {
      await workspace.selectOrganization(organizationId);
      router.replace("/(app)");
    } catch (error) {
      Alert.alert(t.workspaceAccess.errorTitle, error instanceof Error ? error.message : t.workspaceAccess.errorBody);
    } finally {
      setBusyId("");
    }
  };

  const createOrganization = async () => {
    const name = organizationName.trim();
    if (!name) {
      Alert.alert(t.workspaceAccess.errorTitle, t.workspaceAccess.nameRequired);
      return;
    }

    setBusyAction("create");
    try {
      await workspace.createOrganization({ name, type: organizationType });
      router.replace("/(app)");
    } catch (error) {
      Alert.alert(t.workspaceAccess.errorTitle, error instanceof Error ? error.message : t.workspaceAccess.errorBody);
    } finally {
      setBusyAction("");
    }
  };

  const joinInvite = () => {
    const invite = parseInviteInput(inviteValue);
    if (!invite) {
      Alert.alert(t.workspaceAccess.errorTitle, t.workspaceAccess.inviteRequired);
      return;
    }
    setBusyAction("join");
    router.push(`/(auth)/accept-invite?${invite.kind}=${encodeURIComponent(invite.value)}`);
    setBusyAction("");
  };

  const useAnotherAccount = async () => {
    await signOutForAccountSwitch();
    router.replace("/(auth)");
  };

  const activeOrganization = workspace.activeOrganization;

  return (
    <WorkspaceAccessSurface
      eyebrow={t.workspaceAccess.eyebrow}
      title={t.workspaceAccess.title}
      body={t.workspaceAccess.body}
      onBack={() => router.back()}
      footer={(
        <View style={styles.footerActions}>
          {activeOrganization?.id ? (
            <Button
              testID="workspace.continue"
              label={t.workspaceAccess.continueWorkspace}
              trailing={<ArrowRight size={16} color="#FFFFFF" style={mirrorIcon(isRTL)} />}
              onPress={() => router.replace("/(app)")}
              style={styles.footerPrimary}
            />
          ) : null}
          {workspace.isAuthenticated ? (
            <Button
              testID="workspace.use_another_account"
              variant="ghost"
              label={t.workspaceAccess.useAnotherAccount}
              leading={<LogOut size={16} color={colors.textSecondary} style={mirrorIcon(isRTL)} />}
              onPress={() => void useAnotherAccount()}
              textStyle={styles.footerGhostText}
            />
          ) : null}
        </View>
      )}
    >
      {workspace.isPending ? (
        <View style={styles.loadingRow}>
          <Loader2 size={18} color={colors.textMuted} />
          <Text tone="secondary">{t.workspaceAccess.loading}</Text>
        </View>
      ) : null}

      {workspace.organizations.map((organization) => (
        <WorkspaceAccessRow
          key={organization.id}
          testID={`workspace.option.${organization.id}`}
          icon={busyId === organization.id ? <CheckCircle2 size={20} color={colors.accent} /> : <Building2 size={20} color={colors.textPrimary} />}
          title={organization.name ?? t.workspaceAccess.untitledWorkspace}
          meta={organization.slug ?? organization.id}
          disabled={Boolean(busyId || busyAction)}
          onPress={() => void selectOrganization(organization.id)}
        />
      ))}

      <WorkspaceAccessRow
        testID="workspace.join"
        icon={<Users size={20} color={colors.textPrimary} />}
        title={t.workspaceAccess.joinTitle}
        body={t.workspaceAccess.joinBody}
        selected={choice === "join"}
        onPress={() => setChoice(choice === "join" ? null : "join")}
      />
      {choice === "join" ? (
        <View style={styles.inlinePanel}>
          <View style={styles.field}>
            <Link2 size={18} color={colors.textMuted} />
            <TextInput
              testID="workspace.invite_input"
              value={inviteValue}
              onChangeText={setInviteValue}
              placeholder={t.workspaceAccess.invitePlaceholder}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, isRTL && styles.inputRtl]}
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
          <Button
            testID="workspace.join_submit"
            label={busyAction === "join" ? t.common.loading : t.workspaceAccess.joinButton}
            trailing={<ArrowRight size={16} color="#FFFFFF" style={mirrorIcon(isRTL)} />}
            onPress={joinInvite}
            disabled={busyAction === "join"}
          />
        </View>
      ) : null}

      <WorkspaceAccessRow
        testID="workspace.create"
        icon={<Plus size={20} color={colors.textPrimary} />}
        title={t.workspaceAccess.createTitle}
        body={t.workspaceAccess.createBody}
        selected={choice === "create"}
        onPress={() => setChoice(choice === "create" ? null : "create")}
      />
      {choice === "create" ? (
        <View style={styles.inlinePanel}>
          <View style={styles.field}>
            <Building2 size={18} color={colors.textMuted} />
            <TextInput
              testID="workspace.name_input"
              value={organizationName}
              onChangeText={setOrganizationName}
              placeholder={t.workspaceAccess.namePlaceholder}
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.input, isRTL && styles.inputRtl]}
              textAlign={isRTL ? "right" : "left"}
            />
          </View>
          <View style={styles.segmented}>
            {(["broker", "developer"] as const).map((type) => (
              <Pressable
                key={type}
                testID={`workspace.type.${type}`}
                onPress={() => setOrganizationType(type)}
                style={[styles.segment, organizationType === type && styles.segmentSelected]}
              >
                <Text style={[styles.segmentText, organizationType === type && styles.segmentTextSelected]}>
                  {type === "broker" ? t.workspaceAccess.typeBroker : t.workspaceAccess.typeDeveloper}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button
            testID="workspace.create_submit"
            label={busyAction === "create" ? t.common.loading : t.workspaceAccess.createButton}
            trailing={<ArrowRight size={16} color="#FFFFFF" style={mirrorIcon(isRTL)} />}
            onPress={() => void createOrganization()}
            disabled={busyAction === "create"}
          />
        </View>
      ) : null}
    </WorkspaceAccessSurface>
  );
}

const createStyles = (colors: any, isRTL: boolean) => StyleSheet.create({
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
  inlinePanel: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
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
  segmented: {
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: theme.spacing.sm,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentSelected: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}14`,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Manrope_800ExtraBold",
    textTransform: "uppercase",
  },
  segmentTextSelected: {
    color: colors.accent,
  },
  footerActions: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  footerPrimary: {
    width: "100%",
  },
  footerGhostText: {
    color: colors.textSecondary,
  },
});
