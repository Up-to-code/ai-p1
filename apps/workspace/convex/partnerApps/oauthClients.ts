import { v } from "convex/values";
import { action } from "../_generated/server";

const oauthClientSyncInputValidator = v.object({
  workspacePartnerAppId: v.string(),
  clientId: v.string(),
  clientType: v.union(v.literal("public"), v.literal("confidential")),
  name: v.string(),
  homepageUrl: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  redirectUris: v.array(v.string()),
  allowedScopes: v.array(v.string()),
  status: v.union(
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("suspended"),
  ),
});

export const upsertFromPartnersService = action({
  args: { input: oauthClientSyncInputValidator },
  returns: v.object({ clientId: v.string(), created: v.boolean() }),
  handler: async (ctx, args) => {
    console.warn(
      `[partnerApps/oauthClients] Ignored legacy OAuth client sync for ${args.input.clientId}; partner access now uses WorkOS API keys.`,
    );
    return { clientId: args.input.clientId, created: false };
  },
});
