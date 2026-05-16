import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

type LegacyPartnerConnection = {
  _id: Id<"organizationPartnerConnections">;
  partnersAppId?: string;
  partnersClientId?: string;
  partnerAppId?: string;
  oauthClientId?: string;
};

function missingCanonicalFields(connection: LegacyPartnerConnection) {
  return !connection.partnersAppId || !connection.partnersClientId;
}

export function partnerConnectionCanonicalPatch(connection: LegacyPartnerConnection) {
  if (!missingCanonicalFields(connection)) return null;
  if (!connection.partnerAppId || !connection.oauthClientId) return null;
  return {
    partnersAppId: connection.partnersAppId ?? connection.partnerAppId,
    partnersClientId: connection.partnersClientId ?? connection.oauthClientId,
    partnerAppId: undefined,
    oauthClientId: undefined,
  };
}

export const previewPartnerConnectionFieldCutover = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    checked: v.number(),
    needsMigration: v.number(),
    blocked: v.number(),
    examples: v.array(v.object({
      id: v.string(),
      hasPartnersAppId: v.boolean(),
      hasPartnersClientId: v.boolean(),
      hasLegacyPartnerAppId: v.boolean(),
      hasLegacyOauthClientId: v.boolean(),
    })),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 200, 1000));
    const connections = await ctx.db.query("organizationPartnerConnections").take(limit);
    const examples = [];
    let needsMigration = 0;
    let blocked = 0;

    for (const connection of connections as LegacyPartnerConnection[]) {
      if (!missingCanonicalFields(connection)) continue;
      needsMigration += 1;
      if (!connection.partnerAppId || !connection.oauthClientId) blocked += 1;
      if (examples.length < 20) {
        examples.push({
          id: connection._id,
          hasPartnersAppId: Boolean(connection.partnersAppId),
          hasPartnersClientId: Boolean(connection.partnersClientId),
          hasLegacyPartnerAppId: Boolean(connection.partnerAppId),
          hasLegacyOauthClientId: Boolean(connection.oauthClientId),
        });
      }
    }

    return {
      checked: connections.length,
      needsMigration,
      blocked,
      examples,
    };
  },
});

export const backfillPartnerConnectionCanonicalFields = mutation({
  args: { limit: v.optional(v.number()), dryRun: v.optional(v.boolean()) },
  returns: v.object({
    checked: v.number(),
    patched: v.number(),
    skipped: v.number(),
    blocked: v.number(),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 100, 500));
    const connections = await ctx.db.query("organizationPartnerConnections").take(limit);
    let patched = 0;
    let skipped = 0;
    let blocked = 0;

    for (const connection of connections as LegacyPartnerConnection[]) {
      if (!missingCanonicalFields(connection)) {
        skipped += 1;
        continue;
      }

      const patch = partnerConnectionCanonicalPatch(connection);
      if (!patch) {
        blocked += 1;
        continue;
      }

      patched += 1;
      if (!args.dryRun) {
        await ctx.db.patch(connection._id, patch);
      }
    }

    return {
      checked: connections.length,
      patched,
      skipped,
      blocked,
    };
  },
});
