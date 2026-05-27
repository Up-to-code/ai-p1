import { useMemo } from "react";

import { authClient } from "@/auth/authClient";
import { useAuthSession } from "@/auth/useAuthSession";
import {
  acceptWorkspaceInviteLink,
  createAndSelectWorkspaceOrganization,
  createWorkspaceInviteLink,
  selectWorkspaceOrganization,
  type AuthResult,
  type WorkspaceOrganization,
} from "@/auth/workspaceAccess";

type OrganizationApi = {
  create?: (input: {
    name: string;
    slug: string;
    metadata?: Record<string, unknown>;
  }) => Promise<AuthResult<WorkspaceOrganization | null>>;
  setActive?: (input: { organizationId: string }) => Promise<AuthResult<WorkspaceOrganization | null>>;
};

export function useWorkspaceAccess() {
  const { isAuthenticated, isReady } = useAuthSession();
  const activeOrganization = authClient.useActiveOrganization();
  const organizationsQuery = authClient.useListOrganizations();
  const organizationApi = (authClient.organization ?? {}) as OrganizationApi;

  const active = activeOrganization?.data as WorkspaceOrganization | null | undefined;
  const organizations = useMemo(() => {
    const rows = [...((organizationsQuery?.data ?? []) as WorkspaceOrganization[])];
    if (active?.id && !rows.some((organization) => organization.id === active.id)) {
      rows.unshift(active);
    }
    return rows;
  }, [active, organizationsQuery?.data]);
  const isPending = Boolean(activeOrganization?.isPending || organizationsQuery?.isPending);

  return {
    isReady,
    isAuthenticated,
    isPending,
    activeOrganization: active ?? null,
    organizationId: active?.id ?? null,
    organizations,
    async selectOrganization(organizationId: string) {
      if (!organizationApi.setActive) throw new Error("Workspace selection is not available.");
      return selectWorkspaceOrganization({ organizationId, setActive: organizationApi.setActive });
    },
    async createOrganization(input: { name: string; type: "broker" | "developer" }) {
      if (!organizationApi.create || !organizationApi.setActive) {
        throw new Error("Workspace creation is not available.");
      }
      return createAndSelectWorkspaceOrganization({
        ...input,
        create: organizationApi.create,
        setActive: organizationApi.setActive,
      });
    },
    async acceptInvite(token: string) {
      return acceptWorkspaceInviteLink(token);
    },
    async createInviteLink(input: { organizationId: string; role: string; locale: string }) {
      return createWorkspaceInviteLink(input.organizationId, { role: input.role, locale: input.locale });
    },
  };
}
