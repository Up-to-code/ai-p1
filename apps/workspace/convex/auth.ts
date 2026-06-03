import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { oauthProvider } from "@better-auth/oauth-provider";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { jwt, organization } from "better-auth/plugins";
import {
  organizationAccessControl,
  organizationRoles,
} from "../src/packages/authz";
import { getAuthRuntimeConfig } from "../src/packages/config/auth";
import { partnerAppsRuntimeConfig } from "../src/packages/config/partner-apps";
import { normalizeSocialSignInCallbackURL } from "../src/server/auth/better-auth/callback-normalization";
import {
  partnerAdvertisedMetadata,
  partnerClientRegistrationAllowedScopes,
  partnerClientRegistrationDefaultScopes,
  partnerOAuthClaims,
  partnerOAuthScopes,
  partnerScopeExpirations,
  scopeToPermission,
} from "@qentrah/partner-auth-core";
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

function workspaceAuthCallbackPlugin(): BetterAuthPlugin {
  return {
    id: "workspace-auth-callback",
    hooks: {
      before: [
        {
          matcher: (ctx) => Boolean(ctx.method === "POST" && ctx.path?.startsWith("/sign-in/social")),
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.body?.callbackURL) {
              ctx.body.callbackURL = normalizeSocialSignInCallbackURL(ctx.body.callbackURL);
            }
            return { context: ctx };
          }),
        },
      ],
    },
  };
}

// Auth options are shared by runtime auth and the schema generator.
export const createAuthOptions = (
  ctx: GenericCtx<DataModel>,
  mode: "runtime" | "schema",
) => {
  const authRuntimeConfig = getAuthRuntimeConfig(mode);
  const oauthScopes = [...partnerOAuthScopes];
  const hasPartnerScope = (scopes: readonly string[]) =>
    scopes.some((scope) => Boolean(scopeToPermission(scope)));
  const socialProviders: BetterAuthOptions["socialProviders"] = {
    google: {
      clientId: authRuntimeConfig.googleClientId,
      clientSecret: authRuntimeConfig.googleClientSecret,
    },
  };

  if (authRuntimeConfig.appleClientId) {
    socialProviders.apple = {
      clientId: authRuntimeConfig.appleClientId,
      ...(authRuntimeConfig.appleAppBundleIdentifier
        ? { appBundleIdentifier: authRuntimeConfig.appleAppBundleIdentifier }
        : {}),
    };
  }

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
    socialProviders,
    plugins: [
      workspaceAuthCallbackPlugin(),
      jwt({ jwks: { keyPairConfig: { alg: "RS256" } } }),
      convex({ authConfig, jwksRotateOnTokenGenerationError: true }),
      expo(),
      oauthProvider({
        loginPage: "/en/sign-in",
        consentPage: "/oauth/consent",
        scopes: [...oauthScopes],
        advertisedMetadata: partnerAdvertisedMetadata(),
        validAudiences: [
          authRuntimeConfig.siteUrl,
          partnerAppsRuntimeConfig.oauthAudience,
        ].filter(Boolean),
        clientRegistrationDefaultScopes: partnerClientRegistrationDefaultScopes(),
        clientRegistrationAllowedScopes: partnerClientRegistrationAllowedScopes(),
        allowDynamicClientRegistration: false,
        accessTokenExpiresIn: 60 * 60,
        refreshTokenExpiresIn: 30 * 24 * 60 * 60,
        scopeExpirations: partnerScopeExpirations,
        silenceWarnings: { oauthAuthServerConfig: true },
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
            [partnerOAuthClaims.organizationId]: referenceId,
            [partnerOAuthClaims.partnerScopes]: partnerScopes,
          };
        },
        customTokenResponseFields: ({ verificationValue }) => {
          if (!verificationValue?.referenceId) return {};
          return { [partnerOAuthClaims.organizationId]: verificationValue.referenceId };
        },
        prefix: {
          clientSecret: "qentrah_oac_",
          refreshToken: "qentrah_ort_",
          opaqueAccessToken: "qentrah_oat_",
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
