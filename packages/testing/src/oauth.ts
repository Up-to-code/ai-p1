import type { OAuthAuthorizationPrompt } from "@anan/domain-contracts/oauth";

export function buildOAuthAuthorizationPrompt(
  overrides: Partial<OAuthAuthorizationPrompt> = {},
): OAuthAuthorizationPrompt {
  return {
    flowId: "flow-1",
    client: {
      clientId: "client-1",
      name: "External App",
      publisherName: "Anan",
      trusted: true,
    },
    user: {
      email: "user@anan.test",
      name: "Anan User",
    },
    state: "state",
    redirectUri: "https://external.test/callback",
    requestedScopes: [{ id: "properties:read", label: "Read properties" }],
    offlineAccess: false,
    organizations: [],
    selectedTenantOrgId: null,
    selectedOrganization: null,
    requiresOrganizationSelection: false,
    canApproveSelectedOrganization: true,
    managerApprovalRequired: false,
    requiresConsent: true,
    existingAuthorization: null,
    ...overrides,
  };
}
