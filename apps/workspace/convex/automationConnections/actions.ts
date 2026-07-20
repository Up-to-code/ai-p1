"use node";

import { ConvexError, v, type Infer } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { getAuthUser } from "../auth";
import { encryptAutomationCredentials } from "./credentialCrypto";
import { connectionSecretValidator } from "./validators";

function validateSecret(
  secret: Infer<typeof connectionSecretValidator>,
) {
  if (secret.provider === "google_sheets") {
    const credentials = secret.credentials;
    if (!credentials.accessToken?.trim() && !credentials.refreshToken?.trim()) {
      throw new ConvexError({
        code: "GOOGLE_CREDENTIAL_REQUIRED",
        message: "A Google access token or refresh token is required.",
      });
    }
    return;
  }
  if (
    !secret.credentials.accessToken.trim() ||
    !secret.credentials.phoneNumberId.trim()
  ) {
    throw new ConvexError({
      code: "WHATSAPP_CREDENTIAL_REQUIRED",
      message: "A WhatsApp access token and phone number ID are required.",
    });
  }
}

export const save = action({
  args: {
    connectionId: v.optional(v.id("automationConnections")),
    organizationId: v.string(),
    label: v.string(),
    accountLabel: v.optional(v.string()),
    secret: connectionSecretValidator,
  },
  returns: v.id("automationConnections"),
  handler: async (ctx, args): Promise<Id<"automationConnections">> => {
    const user = await getAuthUser(ctx);
    await ctx.runQuery(internal.automationConnections.internal.assertMembership, {
      organizationId: args.organizationId,
      userId: user._id,
    });
    validateSecret(args.secret);
    const encrypted = encryptAutomationCredentials(args.secret);
    return await ctx.runMutation(internal.automationConnections.internal.store, {
      connectionId: args.connectionId,
      organizationId: args.organizationId,
      ownerUserId: user._id,
      provider: args.secret.provider,
      label: args.label,
      accountLabel: args.accountLabel,
      ...encrypted,
    });
  },
});
