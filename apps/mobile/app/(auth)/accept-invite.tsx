import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Loader2, LogIn, TriangleAlert } from "lucide-react-native";

import { Button } from "@/foundation/primitives/Button";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { theme, type AppColors } from "@/foundation/theme/tokens";
import { useAppLocalization } from "@/foundation/localization";
import { WorkspaceAccessSurface } from "@/auth/components/WorkspaceAccessSurface";
import { getAcceptedWorkspaceOrganizationId } from "@/auth/workspaceAccess";
import { useWorkspaceAccess } from "@/auth/useWorkspaceAccess";
import { authRouteWithCallback } from "@/auth/authNavigation";

export default function AcceptInviteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ inviteToken?: string; invitationId?: string }>();
  const workspace = useWorkspaceAccess();
  const { colors } = useTheme();
  const { t } = useAppLocalization();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted" | "error">("idle");
  const [error, setError] = useState("");
  const startedRef = useRef(false);
  const inviteToken = Array.isArray(params.inviteToken) ? params.inviteToken[0] : params.inviteToken;
  const invitationId = Array.isArray(params.invitationId) ? params.invitationId[0] : params.invitationId;
  const currentPath = `/(auth)/accept-invite?${inviteToken ? `inviteToken=${encodeURIComponent(inviteToken)}` : `invitationId=${encodeURIComponent(invitationId ?? "")}`}`;

  useEffect(() => {
    if (!workspace.isReady || !workspace.isAuthenticated || !inviteToken || startedRef.current) {
      return;
    }

    let cancelled = false;
    startedRef.current = true;
    setStatus("accepting");
    workspace.acceptInvite(inviteToken)
      .then(async (result) => {
        if (cancelled) return;
        const organizationId = getAcceptedWorkspaceOrganizationId(result);
        if (organizationId) {
          await workspace.selectOrganization(organizationId);
        }
        if (cancelled) return;
        setStatus("accepted");
        setTimeout(() => router.replace("/(app)"), 700);
      })
      .catch((caught) => {
        if (cancelled) return;
        startedRef.current = false;
        setStatus("error");
        setError(caught instanceof Error ? caught.message : t.workspaceAccess.acceptErrorBody);
      });

    return () => {
      cancelled = true;
    };
  }, [inviteToken, router, t.workspaceAccess.acceptErrorBody, workspace]);

  if (workspace.isReady && !workspace.isAuthenticated) {
    return (
      <WorkspaceAccessSurface
        eyebrow={t.workspaceAccess.inviteEyebrow}
        title={t.workspaceAccess.signInInviteTitle}
        body={t.workspaceAccess.signInInviteBody}
        onBack={() => router.back()}
      >
        <View style={styles.stateCard}>
          <LogIn size={28} color={colors.accent} />
          <Button
            label={t.auth.logIn}
            onPress={() => router.replace(authRouteWithCallback("/(auth)/login", currentPath) as never)}
          />
        </View>
      </WorkspaceAccessSurface>
    );
  }

  if (invitationId && !inviteToken) {
    return (
      <WorkspaceAccessSurface
        eyebrow={t.workspaceAccess.inviteEyebrow}
        title={t.workspaceAccess.acceptErrorTitle}
        body={t.workspaceAccess.invitationUnsupported}
        onBack={() => router.back()}
      >
        <View style={styles.stateCard}>
          <TriangleAlert size={28} color={colors.textMuted} />
          <Button label={t.workspaceAccess.chooseWorkspaceButton} onPress={() => router.replace("/(auth)/choose-workspace")} />
        </View>
      </WorkspaceAccessSurface>
    );
  }

  if (!inviteToken) {
    return <Redirect href="/(auth)/choose-workspace" />;
  }

  const icon = status === "accepted"
    ? <CheckCircle2 size={30} color={colors.success} />
    : status === "error"
      ? <TriangleAlert size={30} color="#EF4444" />
      : <Loader2 size={30} color={colors.accent} />;

  const title = status === "accepted"
    ? t.workspaceAccess.acceptedTitle
    : status === "error"
      ? t.workspaceAccess.acceptErrorTitle
      : t.workspaceAccess.acceptingTitle;

  const body = status === "accepted"
    ? t.workspaceAccess.acceptedBody
    : status === "error"
      ? error
      : t.workspaceAccess.acceptingBody;

  return (
    <WorkspaceAccessSurface
      eyebrow={t.workspaceAccess.inviteEyebrow}
      title={title}
      body={body}
      onBack={() => router.back()}
    >
      <View style={styles.stateCard}>
        {icon}
        {status === "error" ? (
          <Button label={t.common.retry} onPress={() => {
            startedRef.current = false;
            setStatus("idle");
            Alert.alert(t.workspaceAccess.inviteEyebrow, t.workspaceAccess.acceptingBody);
          }} />
        ) : null}
      </View>
    </WorkspaceAccessSurface>
  );
}

const createStyles = (colors: AppColors) => ({
  stateCard: {
    minHeight: 180,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: theme.spacing.lg,
    padding: theme.spacing.xl,
    backgroundColor: colors.surface,
  },
});
