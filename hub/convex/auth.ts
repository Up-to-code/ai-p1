import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { organization } from "better-auth/plugins";
import {
  organizationAccessControl,
  organizationRoles,
} from "../src/packages/authz";
import { getAuthRuntimeConfig } from "../src/packages/config/auth";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authSchema from "./betterAuth/schema";

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

  return {
    appName: "Anan Hub",
    baseURL: authRuntimeConfig.siteUrl,
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
      convex({ authConfig }),
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
