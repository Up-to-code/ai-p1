import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

const MIGRATION_KEY = "remove-assets-2026-06-agency-client-ops";
const legacyAssetsTable = "assets" as never;

type LegacyAsset = {
  _id: never;
  organizationId: string;
};

function legacyDb(ctx: MutationCtx) {
  return ctx.db as unknown as {
    query: (table: never) => {
      withIndex: (
        indexName: string,
        range: (q: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => { take: (limit: number) => Promise<LegacyAsset[]> };
    };
    delete: (id: never) => Promise<void>;
  };
}

export const archiveLegacyAssets = internalMutation({
  args: {
    organizationId: v.string(),
    limit: v.optional(v.number()),
    deleteAfterArchive: v.optional(v.boolean()),
  },
  returns: v.object({
    archivedAssets: v.number(),
    deletedAssets: v.number(),
    patchedRecordLinks: v.number(),
    patchedCustomFieldDefinitions: v.number(),
    patchedCustomFieldValues: v.number(),
    patchedMediaAssets: v.number(),
    patchedMediaFolders: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "update");

    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500);
    const now = Date.now();
    const assets = await legacyDb(ctx)
      .query(legacyAssetsTable)
      .withIndex("by_organization_updated", (q) => q.eq("organizationId", args.organizationId))
      .take(limit);

    let archivedAssets = 0;
    let deletedAssets = 0;

    for (const asset of assets) {
      const existingArchive = await ctx.db
        .query("migrationArchives")
        .withIndex("by_source", (q) => q.eq("sourceTable", "assets").eq("sourceId", asset._id))
        .first();

      if (!existingArchive) {
        await ctx.db.insert("migrationArchives", {
          organizationId: args.organizationId,
          migrationKey: MIGRATION_KEY,
          sourceTable: "assets",
          sourceId: asset._id,
          payload: asset,
          archivedByUserId: user._id,
          archivedAt: now,
        });
        archivedAssets += 1;
      }

      if (args.deleteAfterArchive) {
        await ctx.db.delete(asset._id);
        deletedAssets += 1;
      }
    }

    const recordLinks = await ctx.db
      .query("recordLinks")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(1_000);
    let patchedRecordLinks = 0;
    for (const link of recordLinks) {
      if (!link.deletedAt && ((link.sourceRecordType as string) === "asset" || (link.targetRecordType as string) === "asset")) {
        await ctx.db.patch(link._id, { deletedAt: now });
        patchedRecordLinks += 1;
      }
    }

    const customFieldDefinitions = await ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(1_000);
    let patchedCustomFieldDefinitions = 0;
    for (const definition of customFieldDefinitions) {
      if (definition.appliesTo.includes("asset" as never)) {
        const appliesTo = definition.appliesTo.filter((recordType) => recordType !== ("asset" as never));
        await ctx.db.patch(definition._id, {
          appliesTo,
          deletedAt: appliesTo.length === 0 ? now : definition.deletedAt,
          updatedAt: now,
        });
        patchedCustomFieldDefinitions += 1;
      }
    }

    const customFieldValues = await ctx.db
      .query("customFieldValues")
      .withIndex("by_organization_record", (q) => q.eq("organizationId", args.organizationId).eq("recordType", "asset" as never))
      .take(1_000);
    let patchedCustomFieldValues = 0;
    for (const value of customFieldValues) {
      if (!value.deletedAt) {
        await ctx.db.patch(value._id, { deletedAt: now, updatedAt: now });
        patchedCustomFieldValues += 1;
      }
    }

    const mediaAssets = await ctx.db
      .query("mediaAssets")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(1_000);
    let patchedMediaAssets = 0;
    for (const media of mediaAssets) {
      if ((media.resourceType as string) === "asset") {
        await ctx.db.delete(media._id);
        patchedMediaAssets += 1;
      }
    }

    const mediaFolders = await ctx.db
      .query("mediaFolders")
      .withIndex("by_updated")
      .take(1_000);
    let patchedMediaFolders = 0;
    for (const folder of mediaFolders) {
      if (folder.organizationId === args.organizationId && (folder.resourceType as string) === "asset" && !folder.deletedAt) {
        await ctx.db.patch(folder._id, { deletedAt: now, updatedAt: now });
        patchedMediaFolders += 1;
      }
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "migration.assets.archive",
      target: args.organizationId,
      summary: `Archived ${archivedAssets} legacy asset record(s).`,
      createdAt: now,
    });

    return {
      archivedAssets,
      deletedAssets,
      patchedRecordLinks,
      patchedCustomFieldDefinitions,
      patchedCustomFieldValues,
      patchedMediaAssets,
      patchedMediaFolders,
    };
  },
});
