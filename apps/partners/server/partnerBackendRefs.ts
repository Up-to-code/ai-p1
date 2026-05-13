import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";

export const partnerBackendRefs = {
  partnerAccount: {
    getCurrentPartnerAccount: makeFunctionReference<"query", Record<string, never>, unknown>("partnerAccount:getCurrentPartnerAccount"),
    updateCurrentPartnerProfile: makeFunctionReference<"mutation", { name: string }, { ok: true }>(
      "partnerAccount:updateCurrentPartnerProfile",
    ),
    updateCurrentProgrammerOrganization: makeFunctionReference<"mutation", { name: string; countryCode: string }, { ok: true }>(
      "partnerAccount:updateCurrentProgrammerOrganization",
    ),
  },
  partnerApps: {
    createPartnerApp: makeFunctionReference<
      "mutation",
      {
        name: string;
        publisherName: string;
        homepageUrl: string;
        iconUrl?: string;
        logoUrl?: string;
        clientType: "public" | "confidential";
        redirectUris: string[];
        allowedScopes: string[];
      },
      { appId: string; clientId: string; clientSecret?: string }
    >("partnerApps:createPartnerApp"),
    listPartnerApps: makeFunctionReference<"query", Record<string, never>, unknown[]>("partnerApps:listPartnerApps"),
    updatePartnerApp: makeFunctionReference<
      "mutation",
      {
        appId: string;
        name: string;
        publisherName: string;
        homepageUrl: string;
        iconUrl?: string;
        logoUrl?: string;
        redirectUris: string[];
        allowedScopes: string[];
      },
      { ok: true }
    >("partnerApps:updatePartnerApp"),
    submitPartnerAppForReview: makeFunctionReference<"mutation", { appId: string }, { ok: true }>("partnerApps:submitPartnerAppForReview"),
    recordWorkspaceSyncResult: makeFunctionReference<
      "mutation",
      {
        appId: string;
        ok: boolean;
        workspacePartnerAppId?: string;
        workspaceOauthClientId?: string;
        error?: string;
      },
      { ok: true }
    >("partnerApps:recordWorkspaceSyncResult"),
    applyWorkspaceReviewDecision: makeFunctionReference<
      "mutation",
      {
        serviceToken: string;
        appId: string;
        status: "approved" | "rejected" | "suspended";
        workspacePartnerAppId?: string;
        workspaceOauthClientId?: string;
        reviewNotes?: string;
        clientSecret?: string;
      },
      { ok: true }
    >("partnerApps:applyWorkspaceReviewDecision"),
  },
  sandbox: {
    getSandboxForApp: makeFunctionReference<"query", { appId: string }, unknown>("sandbox:getSandboxForApp"),
    ensureSandboxForApp: makeFunctionReference<"mutation", { appId: string }, unknown>("sandbox:ensureSandboxForApp"),
    createAuthorizationCode: makeFunctionReference<
      "mutation",
      {
        clientId: string;
        redirectUri: string;
        scopes: string[];
        codeChallenge: string;
        codeChallengeMethod: "S256";
      },
      { code: string; redirectUri: string; organizationId: string }
    >("sandbox:createAuthorizationCode"),
    exchangeAuthorizationCode: makeFunctionReference<
      "mutation",
      {
        code: string;
        clientId: string;
        redirectUri: string;
        codeChallenge: string;
        accessTokenHash: string;
        refreshTokenHash: string;
      },
      { organizationId: string; scopes: string[]; expiresIn: number }
    >("sandbox:exchangeAuthorizationCode"),
    rotateRefreshToken: makeFunctionReference<
      "mutation",
      {
        refreshTokenHash: string;
        accessTokenHash: string;
        nextRefreshTokenHash: string;
      },
      { organizationId: string; scopes: string[]; expiresIn: number }
    >("sandbox:rotateRefreshToken"),
    validateAccess: makeFunctionReference<"query", Record<string, unknown>, unknown>("sandbox:validateAccess"),
    readResource: makeFunctionReference<"query", Record<string, unknown>, unknown>("sandbox:readResource"),
    writeResource: makeFunctionReference<"mutation", Record<string, unknown>, unknown>("sandbox:writeResource"),
    recordRequestLog: makeFunctionReference<"mutation", Record<string, unknown>, { ok: true }>("sandbox:recordRequestLog"),
  },
  partnerOrganizations: {
    ensureCurrentPartnerProfile: makeFunctionReference<"mutation", Record<string, never>, { ok: true }>("partnerOrganizations:ensureCurrentPartnerProfile"),
    createProgrammerOrganizationForCurrentPartner: makeFunctionReference<"mutation", Record<string, unknown>, { organizationId: string }>(
      "partnerOrganizations:createProgrammerOrganizationForCurrentPartner",
    ),
  },
} as const;

export function partnerQuery<TResult>(token: string, ref: unknown, args: Record<string, unknown> = {}) {
  return fetchQuery(ref as never, args as never, { token }) as Promise<TResult>;
}

export function partnerMutation<TResult>(token: string, ref: unknown, args: Record<string, unknown> = {}) {
  return fetchMutation(ref as never, args as never, { token }) as Promise<TResult>;
}

export function partnerAction<TResult>(token: string, ref: unknown, args: Record<string, unknown> = {}) {
  return fetchAction(ref as never, args as never, { token }) as Promise<TResult>;
}
