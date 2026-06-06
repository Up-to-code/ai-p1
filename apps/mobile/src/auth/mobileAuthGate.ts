import { useEffect, useMemo, useRef, useState } from "react";

import { authClient, isAuthConfigured } from "@/auth/authClient";
import { resolveMobileAuthGate } from "@/auth/mobileAuthGateResolver";
import { getWorkspaceOrganizationRegions, mergeWorkspaceOrganizations, type WorkspaceOrganization } from "@/auth/workspaceAccess";
import { setWorkspaceOrganizationRequestContext } from "@/persistence/api/workspaceApiClient";
import { useAppStore } from "@/store";

let activeAutoSelectionId: string | null = null;

function errorMessage(error: unknown) {
  if (!error) return "";
  return error instanceof Error ? error.message : "Unable to load workspace access.";
}

export function useMobileAuthGate() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const e2eForceAuthScreen = useAppStore((state) => state.e2eForceAuthScreen);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eQaUser = useAppStore((state) => state.e2eQaUser);
  const session = authClient.useSession();
  const activeOrganization = authClient.useActiveOrganization();
  const organizationsQuery = authClient.useListOrganizations();
  const organizationApi = authClient.organization as
    | { setActive?: (input: { organizationId: string }) => Promise<unknown> }
    | undefined;
  const [activationError, setActivationError] = useState("");
  const selectionAttemptRef = useRef("");

  const active = activeOrganization.data as WorkspaceOrganization | null | undefined;
  const organizations = useMemo(
    () => mergeWorkspaceOrganizations((organizationsQuery.data ?? []) as WorkspaceOrganization[], active),
    [active, organizationsQuery.data],
  );
  const organizationId = active?.id ?? null;
  const regions = useMemo(() => getWorkspaceOrganizationRegions(active), [active]);
  const e2eSignedIn = Boolean(e2eQaMode && e2eQaUser);
  const hasSession = Boolean(session.data?.session);
  const workspaceError = activationError || errorMessage(activeOrganization.error) || errorMessage(organizationsQuery.error);
  const organizationPending = Boolean(activeOrganization.isPending || organizationsQuery.isPending);

  const resolution = useMemo(
    () => resolveMobileAuthGate({
      activeOrganizationId: organizationId,
      authConfigured: isAuthConfigured(),
      authPending: session.isPending,
      e2eForceAuthScreen,
      e2eSignedIn,
      hasSession,
      hydrationComplete,
      organizationCount: organizations.length,
      organizationPending,
      workspaceError,
    }),
    [e2eForceAuthScreen, e2eSignedIn, hasSession, hydrationComplete, organizationId, organizationPending, organizations.length, session.isPending, workspaceError],
  );

  useEffect(() => {
    setWorkspaceOrganizationRequestContext({ organizationId, regions });
  }, [organizationId, regions]);

  useEffect(() => {
    if (resolution.status !== "selecting_workspace") return;
    const organization = organizations[0];
    if (!organization?.id || !organizationApi?.setActive) {
      setActivationError("Workspace selection is not available.");
      return;
    }
    if (selectionAttemptRef.current === organization.id || activeAutoSelectionId === organization.id) return;

    let cancelled = false;
    selectionAttemptRef.current = organization.id;
    activeAutoSelectionId = organization.id;
    setActivationError("");
    organizationApi.setActive({ organizationId: organization.id })
      .catch((error) => {
        if (!cancelled) {
          selectionAttemptRef.current = "";
          setActivationError(error instanceof Error ? error.message : "Could not select this workspace.");
        }
      })
      .finally(() => {
        if (activeAutoSelectionId === organization.id) {
          activeAutoSelectionId = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [organizationApi, organizations, resolution.status]);

  const user = e2eSignedIn
    ? e2eQaUser
    : resolution.isAuthenticated
      ? session.data?.user ?? null
      : null;

  return {
    ...resolution,
    activeOrganization: active ?? null,
    error: workspaceError || null,
    organizationId,
    organizations,
    regions,
    session: session.data?.session ?? null,
    user,
  };
}
