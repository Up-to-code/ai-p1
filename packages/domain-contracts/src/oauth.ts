/**
 * WHY:   OAuth pages should consume stable DTOs from the Next.js server layer instead of raw Convex results.
 * WHAT:  Shared OAuth DTOs for consent prompts, connected apps, and approval actions.
 * HOW:   They mirror the current web-facing subset of the OAuth grant and client records.
 */

export type OAuthScopeDetail = {
  id: string;
  label: string;
  newlyRequested?: boolean;
};

export type OAuthEligibleOrganization = {
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerId: string;
  organizationType: "broker" | "red";
  organizationName: string;
  organizationSlug?: string;
  role: "manager" | "member" | "viewer";
};

export type OAuthAuthorizationPrompt = {
  flowId: string;
  client: {
    clientId: string;
    name: string;
    publisherName: string;
    logoUrl?: string | null;
    trusted?: boolean;
  };
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  state: string;
  redirectUri: string;
  requestedScopes: OAuthScopeDetail[];
  offlineAccess: boolean;
  organizations: OAuthEligibleOrganization[];
  selectedTenantOrgId: string | null;
  selectedOrganization: OAuthEligibleOrganization | null;
  requiresOrganizationSelection: boolean;
  canApproveSelectedOrganization: boolean;
  managerApprovalRequired: boolean;
  approvalDisabledReason?: string | null;
  requiresConsent: boolean;
  existingAuthorization: {
    organizationName: string;
    tenantOrgId: string;
    grantedScopes: string[];
    createdAt: number;
    updatedAt: number;
    lastUsedAt?: number | null;
  } | null;
};

export type OAuthAuthorizedAppSummary = {
  authorizationId: string;
  clientId: string;
  tenantOrgId: string;
  appName: string;
  publisherName: string;
  logoUrl?: string | null;
  iconUrl?: string | null;
  grantedScopes: string[];
  scopeDetails: OAuthScopeDetail[];
  offlineAccess: boolean;
  status?: "active" | "expired";
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number | null;
};

export type OAuthAuthorizedAppDetail = OAuthAuthorizedAppSummary & {
  redirectUris: string[];
};

export type OAuthApprovalResult = {
  redirectUrl: string;
};

export type AdminOAuthAuthorizationPrompt = {
  flowId: string;
  client: {
    clientId: string;
    name: string;
    publisherName: string;
    logoUrl?: string | null;
    trusted?: boolean;
  };
  user: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  state: string;
  redirectUri: string;
  requestedScopes: OAuthScopeDetail[];
  offlineAccess: boolean;
  requiresConsent: boolean;
  existingAuthorization: {
    grantedScopes: string[];
    createdAt: number;
    updatedAt: number;
    lastUsedAt?: number | null;
  } | null;
};
