import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

type StoredPermission = {
  resource: string;
  actions: Array<"read" | "create" | "update" | "delete">;
};

function normalizeStoredPermissions(permissions: StoredPermission[]) {
  const normalized: StoredPermission[] = [];
  const seen = new Set<string>();

  for (const permission of permissions) {
    if (permission.resource === "asset") {
      continue;
    }

    const resource = permission.resource === "property" ? "project" : permission.resource;
    const key = `${resource}:${permission.actions.slice().sort().join(",")}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push({ ...permission, resource });
  }

  return normalized;
}

function permissionsChanged(before: StoredPermission[], after: StoredPermission[]) {
  if (before.length !== after.length) {
    return true;
  }

  return before.some((permission, index) => {
    const next = after[index];
    return permission.resource !== next.resource || permission.actions.join(",") !== next.actions.join(",");
  });
}

export const purgeAllLegacyAssetMedia = internalMutation({
  args: {},
  returns: v.object({
    deletedMediaAssets: v.number(),
    patchedMediaFolders: v.number(),
    patchedMcpConnections: v.number(),
    patchedApiKeys: v.number(),
    patchedRecordLinks: v.number(),
    patchedCustomFieldDefinitions: v.number(),
    patchedCustomFieldValues: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const allMedia = await ctx.db.query("mediaAssets").collect();
    let deletedMediaAssets = 0;
    for (const media of allMedia) {
      if ((media.resourceType as string) === "asset") {
        await ctx.db.delete(media._id);
        deletedMediaAssets += 1;
      }
    }

    const allFolders = await ctx.db.query("mediaFolders").collect();
    let patchedMediaFolders = 0;
    for (const folder of allFolders) {
      if ((folder.resourceType as string) === "asset" && !folder.deletedAt) {
        await ctx.db.patch(folder._id, { deletedAt: now, updatedAt: now });
        patchedMediaFolders += 1;
      }
    }

    const mcpConnections = await ctx.db.query("organizationMcpConnections").collect();
    let patchedMcpConnections = 0;
    for (const connection of mcpConnections) {
      const permissions = normalizeStoredPermissions(connection.permissions);
      if (permissionsChanged(connection.permissions, permissions)) {
        await ctx.db.patch(connection._id, { permissions, updatedAt: now });
        patchedMcpConnections += 1;
      }
    }

    const apiKeys = await ctx.db.query("organizationApiKeys").collect();
    let patchedApiKeys = 0;
    for (const apiKey of apiKeys) {
      const permissions = normalizeStoredPermissions(apiKey.permissions);
      if (permissionsChanged(apiKey.permissions, permissions)) {
        await ctx.db.patch(apiKey._id, { permissions, updatedAt: now });
        patchedApiKeys += 1;
      }
    }

    const recordLinks = await ctx.db.query("recordLinks").collect();
    let patchedRecordLinks = 0;
    for (const link of recordLinks) {
      if ((link.sourceRecordType as string) === "asset" || (link.targetRecordType as string) === "asset") {
        await ctx.db.delete(link._id);
        patchedRecordLinks += 1;
      }
    }

    const customFieldDefinitions = await ctx.db.query("customFieldDefinitions").collect();
    let patchedCustomFieldDefinitions = 0;
    for (const definition of customFieldDefinitions) {
      const appliesTo = definition.appliesTo.filter((recordType) => (recordType as string) !== "asset");
      if (appliesTo.length !== definition.appliesTo.length) {
        await ctx.db.patch(definition._id, { appliesTo, updatedAt: now });
        patchedCustomFieldDefinitions += 1;
      }
    }

    const customFieldValues = await ctx.db.query("customFieldValues").collect();
    let patchedCustomFieldValues = 0;
    for (const value of customFieldValues) {
      if ((value.recordType as string) === "asset") {
        await ctx.db.delete(value._id);
        patchedCustomFieldValues += 1;
      }
    }

    return {
      deletedMediaAssets,
      patchedMediaFolders,
      patchedMcpConnections,
      patchedApiKeys,
      patchedRecordLinks,
      patchedCustomFieldDefinitions,
      patchedCustomFieldValues,
    };
  },
});
