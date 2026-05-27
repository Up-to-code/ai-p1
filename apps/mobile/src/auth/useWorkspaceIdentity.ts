import { useEffect, useMemo, useState } from "react";

import { authClient } from "@/auth/authClient";
import { useAuthSession } from "@/auth/useAuthSession";

type BetterAuthOrganization = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

type WorkspaceIdentityStatus =
  | "signed_out"
  | "loading"
  | "ready"
  | "needs_workspace"
  | "error";

function getAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const record = error as { code?: unknown; status?: unknown; message?: unknown };
  return [record.code, record.status, record.message]
    .map((value) => typeof value === "string" ? value : typeof value === "number" ? String(value) : "")
    .join(" ");
}

function isUnauthorizedAuthError(error: unknown) {
  return /\b(401|UNAUTHORIZED|Unauthorized)\b/i.test(getAuthErrorCode(error));
}

export function useWorkspaceIdentity() {
  const { isAuthenticated, isReady } = useAuthSession();
  const [activationError, setActivationError] = useState<string | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const activeOrganization = authClient.useActiveOrganization();
  const organizationsQuery = authClient.useListOrganizations();
  const organizationApi = authClient.organization as
    | { setActive?: (input: { organizationId: string }) => Promise<unknown> }
    | undefined;

  const organizations = useMemo(
    () => ((organizationsQuery?.data ?? []) as BetterAuthOrganization[]),
    [organizationsQuery?.data],
  );
  const organizationId = (activeOrganization?.data as BetterAuthOrganization | null | undefined)?.id ?? null;
  const isPending = Boolean(activeOrganization?.isPending || organizationsQuery?.isPending);
  const queryError = activeOrganization?.error ?? organizationsQuery?.error ?? null;

  useEffect(() => {
    if (!isReady || !isAuthenticated || organizationId || !isPending) {
      setLoadingTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => setLoadingTimedOut(true), 8000);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isPending, isReady, organizationId]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || organizationId || isPending || organizations.length !== 1) {
      return;
    }

    let cancelled = false;
    setActivationError(null);
    organizationApi?.setActive?.({ organizationId: organizations[0].id })
      .catch((error) => {
        if (cancelled) return;
        setActivationError(error instanceof Error ? error.message : "Unable to select workspace.");
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isPending, isReady, organizationApi, organizationId, organizations]);

  const status = useMemo<WorkspaceIdentityStatus>(() => {
    if (!isReady) return "loading";
    if (!isAuthenticated) return "signed_out";
    if (isUnauthorizedAuthError(queryError)) return "signed_out";
    if (queryError) return "error";
    if (activationError) return "error";
    if (organizationId) return "ready";
    if (loadingTimedOut) return "needs_workspace";
    if (isPending || organizations.length === 1) return "loading";
    return "needs_workspace";
  }, [activationError, isAuthenticated, isPending, isReady, loadingTimedOut, organizationId, organizations.length, queryError]);

  return {
    status,
    organizationId,
    organizations,
    error: activationError ?? (queryError instanceof Error ? queryError.message : queryError ? "Unable to load workspaces." : null),
    isReady: status === "ready",
  };
}
