import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { jwt, organization } from "better-auth/plugins";
import {
  organizationAccessControl,
  organizationRoles,
} from "../src/packages/authz";
import { getAuthRuntimeConfig } from "../src/packages/config/auth";
import { partnerAppsRuntimeConfig } from "../src/packages/config/partner-apps";
import {
  partnerAppScopes,
  partnerDefaultScopes,
  scopeToPermission,
} from "../src/packages/partner-apps/scopes";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authSchema from "./betterAuth/schema";

const URLWithCanParse = URL as typeof URL & {
  canParse?: (url: string | URL, base?: string | URL) => boolean;
};

if (!URLWithCanParse.canParse) {
  URLWithCanParse.canParse = (url, base) => {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}

// The component client bridges Better Auth storage to Convex and keeps plugin schema local.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: { schema: authSchema },
    verbose: getAuthRuntimeConfig("schema").verbose,
  },
);

// Auth options are shared by runtime auth and the schema generator.
export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  mode: "runtime" | "schema",
) => {
  const authRuntimeConfig = getAuthRuntimeConfig(mode);
  const oauthScopes = [
    "openid",
    "profile",
    "email",
    "offline_access",
    ...partnerAppScopes,
  ];
  const hasPartnerScope = (scopes: readonly string[]) =>
    scopes.some((scope) => Boolean(scopeToPermission(scope)));

  return {
    appName: "Qentrah Workspace",
    baseURL: authRuntimeConfig.siteUrl,
    trustedOrigins: authRuntimeConfig.trustedOrigins,
    secret: authRuntimeConfig.secret,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: authRuntimeConfig.googleClientId,
        clientSecret: authRuntimeConfig.googleClientSecret,
      },
    },
    plugins: [
      jwt({ jwks: { keyPairConfig: { alg: "RS256" } } }),
      convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
      oauthProvider({
        loginPage: "/en/sign-in",
        consentPage: "/oauth/consent",
        scopes: [...oauthScopes],
        advertisedMetadata: { scopes_supported: [...oauthScopes] },
        validAudiences: [
          authRuntimeConfig.siteUrl,
          partnerAppsRuntimeConfig.oauthAudience,
        ].filter(Boolean),
        clientRegistrationDefaultScopes: [
          "openid",
          "profile",
          "email",
          ...partnerDefaultScopes,
        ],
        clientRegistrationAllowedScopes: oauthScopes,
        allowDynamicClientRegistration: false,
        accessTokenExpiresIn: 60 * 60,
        refreshTokenExpiresIn: 30 * 24 * 60 * 60,
        scopeExpirations: {
          "client:create": "15m",
          "client:update": "15m",
          "client:delete": "5m",
          "property:create": "15m",
          "property:update": "15m",
          "property:delete": "5m",
          "project:create": "15m",
          "project:update": "15m",
          "project:delete": "5m",
          "calendar:create": "15m",
          "calendar:update": "15m",
          "calendar:delete": "5m",
          "task:create": "15m",
          "task:update": "15m",
          "task:delete": "5m",
          "media:create": "15m",
          "media:update": "15m",
          "media:delete": "5m",
        },
        clientPrivileges: ({ user }) => {
          if (!user?.email) return undefined;
          return authRuntimeConfig.platformAdminEmails.includes(
            user.email.trim().toLowerCase(),
          ) || undefined;
        },
        postLogin: {
          page: "/oauth/select-organization",
          shouldRedirect: async ({ session, scopes }) =>
            hasPartnerScope(scopes) && !session.activeOrganizationId,
          consentReferenceId: ({ session, scopes }) => {
            if (!hasPartnerScope(scopes)) return undefined;
            const organizationId = session.activeOrganizationId as string | undefined;
            if (!organizationId) {
              throw new Error("Organization selection is required for partner scopes.");
            }
            return organizationId;
          },
        },
        customAccessTokenClaims: ({ referenceId, scopes, metadata }) => {
          const partnerScopes = scopes.filter((scope) => scopeToPermission(scope));
          if (!referenceId || partnerScopes.length === 0) return {};
          if (metadata?.partnerAppStatus !== "approved") {
            throw new Error("Partner app is not approved.");
          }
          return {
            organization_id: referenceId,
            partner_scopes: partnerScopes,
          };
        },
        customTokenResponseFields: ({ verificationValue }) => {
          if (!verificationValue?.referenceId) return {};
          return { organization_id: verificationValue.referenceId };
        },
        prefix: {
          clientSecret: "anan_oac_",
          refreshToken: "anan_ort_",
          opaqueAccessToken: "anan_oat_",
        },
      }),
      organization({
        ac: organizationAccessControl,
        roles: organizationRoles,
        creatorRole: "owner",
        allowUserToCreateOrganization: true,
        teams: {
          enabled: true,
          defaultTeam: { enabled: true },
          allowRemovingAllTeams: false,
        },
        dynamicAccessControl: {
          enabled: true,
          maximumRolesPerOrganization: 50,
        },
      }),
    ],
  } satisfies BetterAuthOptions;
};

export const options = createAuthOptions({} as GenericCtx<DataModel>, "schema");

// Convex HTTP routes create the Better Auth instance per request context.
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx, "runtime"));

export const createSchemaAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx, "schema"));

export const { getAuthUser } = authComponent.clientApi();
