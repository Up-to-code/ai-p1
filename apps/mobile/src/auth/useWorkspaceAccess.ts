import { useMemo } from "react";

import { authClient } from "@/auth/authClient";
import { useMobileAuthGate } from "@/auth/mobileAuthGate";
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
    slug?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<AuthResult<WorkspaceOrganization | null>>;
  setActive?: (input: { organizationId: string }) => Promise<AuthResult<WorkspaceOrganization | null>>;
};

export function useWorkspaceAccess() {
  const gate = useMobileAuthGate();
  const organizationApi = (authClient.organization ?? {}) as OrganizationApi;

  const organizations = useMemo(() => gate.organizations as WorkspaceOrganization[], [gate.organizations]);

  return {
    isReady: gate.isReady,
    isAuthenticated: gate.isAuthenticated,
    isPending: !gate.isReady || gate.status === "selecting_workspace",
    activeOrganization: gate.activeOrganization as WorkspaceOrganization | null,
    organizationId: gate.organizationId,
    regions: gate.regions,
    organizations,
    status: gate.status,
    error: gate.error,
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
