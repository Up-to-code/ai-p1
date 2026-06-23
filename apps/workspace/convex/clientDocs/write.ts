import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { docInputValidator, docValidator, docFolderInputValidator, docFolderValidator } from "./validators";

function presentDoc<TDoc extends { _id: string; visibility?: "private" | "team" | "workspace" }>(doc: TDoc) {
  return { ...doc, id: doc._id, visibility: doc.visibility ?? "private" };
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: docInputValidator },
  returns: docValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const now = Date.now();
    const id = await ctx.db.insert("docs", {
      organizationId: args.organizationId,
      ...args.input,
      visibility: args.input.visibility ?? "private",
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.doc.create",
      target: id,
      summary: `Created doc "${args.input.title}".`,
      createdAt: now,
    });

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Doc could not be created.");
    return presentDoc(doc);
  },
});

export const updateFromHono = mutation({
  args: { organizationId: v.string(), docId: v.id("docs"), input: docInputValidator },
  returns: docValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.docId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Doc was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.docId, {
      ...args.input,
      visibility: args.input.visibility ?? (existing.visibility ?? "private"),
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.doc.update",
      target: args.docId,
      summary: `Updated doc "${args.input.title}".`,
      createdAt: now,
    });

    const doc = await ctx.db.get(args.docId);
    if (!doc) throw new Error("Doc was not found.");
    return presentDoc(doc);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), docId: v.id("docs") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.docId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Doc was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.docId, { deletedAt: now, updatedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.doc.delete",
      target: args.docId,
      summary: `Deleted doc "${existing.title}".`,
      createdAt: now,
    });

    return { removed: true };
  },
});

export const moveToFolder = mutation({
  args: {
    organizationId: v.string(),
    docId: v.id("docs"),
    folderId: v.optional(v.string()),
  },
  returns: docValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.docId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Doc was not found.");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId as any) as any;
      if (!folder || folder.organizationId !== args.organizationId || folder.deletedAt) {
        throw new Error("Target folder was not found.");
      }
    }

    const now = Date.now();
    await ctx.db.patch(args.docId, { folderId: args.folderId ?? undefined, updatedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.doc.move",
      target: args.docId,
      summary: `Moved doc "${existing.title}" to folder.`,
      createdAt: now,
    });

    const doc = await ctx.db.get(args.docId);
    if (!doc) throw new Error("Doc was not found.");
    return presentDoc(doc);
  },
});

export const createFolderFromHono = mutation({
  args: { organizationId: v.string(), input: docFolderInputValidator },
  returns: docFolderValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const now = Date.now();
    const id = await ctx.db.insert("docFolders", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.docFolder.create",
      target: id,
      summary: `Created folder "${args.input.name}".`,
      createdAt: now,
    });

    const folder = await ctx.db.get(id);
    if (!folder) throw new Error("Folder could not be created.");
    return { ...folder, id: folder._id };
  },
});

export const renameFolderFromHono = mutation({
  args: { organizationId: v.string(), folderId: v.id("docFolders"), name: v.string() },
  returns: docFolderValidator,
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.folderId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Folder was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.folderId, { name: args.name, updatedAt: now });

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.docFolder.update",
      target: args.folderId,
      summary: `Renamed folder to "${args.name}".`,
      createdAt: now,
    });

    const folder = await ctx.db.get(args.folderId);
    if (!folder) throw new Error("Folder was not found.");
    return { ...folder, id: folder._id };
  },
});

export const deleteFolderFromHono = mutation({
  args: { organizationId: v.string(), folderId: v.id("docFolders") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    const existing = await ctx.db.get(args.folderId);
    if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) {
      throw new Error("Folder was not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.folderId, { deletedAt: now, updatedAt: now });

    // Move child docs to unorganized (root)
    const childDocs = await ctx.db
      .query("docs")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(500);
    for (const doc of childDocs) {
      if (doc.organizationId === args.organizationId && !doc.deletedAt) {
        await ctx.db.patch(doc._id, { folderId: undefined, updatedAt: now });
      }
    }

    // Move child folders to root
    const childFolders = await ctx.db
      .query("docFolders")
      .withIndex("by_parent", (q) => q.eq("parentId", args.folderId))
      .take(500);
    for (const folder of childFolders) {
      if (folder.organizationId === args.organizationId && !folder.deletedAt) {
        await ctx.db.patch(folder._id, { parentId: undefined, updatedAt: now });
      }
    }

    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: user._id,
      action: "client.docFolder.delete",
      target: args.folderId,
      summary: `Deleted folder "${existing.name}".`,
      createdAt: now,
    });

    return { removed: true };
  },
});
