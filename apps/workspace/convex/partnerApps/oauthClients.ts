import { v } from "convex/values";
import { action } from "../_generated/server";
import { components } from "../_generated/api";
import { normalizeScopes } from "../../src/packages/partner-apps/scopes";
import { partnerAppStatusValidator } from "./validators";

const baseOAuthScopes = ["openid", "profile", "email", "offline_access"] as const;

function oauthClientScopes(scopes: string[]) {
  return Array.from(new Set([...baseOAuthScopes, ...normalizeScopes(scopes)]));
}

function oauthMetadata(workspacePartnerAppId: string, status: string) {
  return JSON.stringify({
    partnerAppId: workspacePartnerAppId,
    partnerAppStatus: status,
  });
}

const oauthClientSyncInputValidator = v.object({
  workspacePartnerAppId: v.string(),
  clientId: v.string(),
  clientType: v.union(v.literal("public"), v.literal("confidential")),
  name: v.string(),
  homepageUrl: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  redirectUris: v.array(v.string()),
  allowedScopes: v.array(v.string()),
  status: partnerAppStatusValidator,
});

export const upsertFromPartnersService = action({
  args: { input: oauthClientSyncInputValidator },
  returns: v.object({ clientId: v.string(), created: v.boolean() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const input = args.input;
    const publicClient = input.clientType === "public";
    const data = {
      clientId: input.clientId,
      name: input.name,
      uri: input.homepageUrl,
      icon: input.logoUrl,
      redirectUris: input.redirectUris,
      scopes: oauthClientScopes(input.allowedScopes),
      tokenEndpointAuthMethod: publicClient ? "none" : "client_secret_basic",
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      public: publicClient,
      type: publicClient ? "spa" : "web",
      requirePKCE: true,
      disabled: input.status === "suspended",
      metadata: oauthMetadata(input.workspacePartnerAppId, input.status),
      updatedAt: now,
    };

    const existing = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "oauthClient",
      where: [{ field: "clientId", value: input.clientId }],
    });

    if (existing) {
      await ctx.runMutation(components.betterAuth.adapter.updateOne, {
        input: {
          model: "oauthClient",
          where: [{ field: "clientId", value: input.clientId }],
          update: data,
        },
      });
      return { clientId: input.clientId, created: false };
    }

    await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "oauthClient",
        data: {
          ...data,
          createdAt: now,
        },
      },
    });
    return { clientId: input.clientId, created: true };
  },
});
