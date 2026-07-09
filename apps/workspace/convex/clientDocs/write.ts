import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { resolveDocumentAccess } from "../access/document";
import {
  docFolderInputValidator,
  docFolderValidator,
  docInputValidator,
  docValidator,
} from "./validators";

const MAX_FOLDER_CHILDREN = 200;

function presentDoc<
  TDoc extends { _id: string; visibility?: "private" | "team" | "workspace" },
>(doc: TDoc) {
  return { ...doc, id: doc._id, visibility: doc.visibility ?? "private" };
}

function notFoundError(
  organizationId: string,
  resource: "document" | "folder",
  resourceId: string,
) {
  return new ConvexError({
    code:
      resource === "document"
        ? "DOCUMENT_NOT_FOUND"
        : "DOCUMENT_FOLDER_NOT_FOUND",
    message:
      resource === "document"
        ? "Document was not found."
        : "Folder was not found.",
    organizationId,
    resourceId,
  });
}

function childLimitError(organizationId: string, folderId: Id<"docFolders">) {
  return new ConvexError({
    code: "DOCUMENT_FOLDER_CHILD_LIMIT",
    message: "Folder has too many children to delete safely.",
    organizationId,
    resourceId: folderId,
  });
}

async function requireFolder(
  ctx: {
    db: { get: (id: Id<"docFolders">) => Promise<Doc<"docFolders"> | null> };
  },
  organizationId: string,
  folderId: string,
) {
  const folder = await ctx.db.get(folderId as Id<"docFolders">);
  if (!folder || folder.organizationId !== organizationId || folder.deletedAt) {
    throw notFoundError(organizationId, "folder", folderId);
  }
  return folder;
}

async function requireDocument(
  ctx: { db: { get: (id: Id<"docs">) => Promise<Doc<"docs"> | null> } },
  organizationId: string,
  docId: Id<"docs">,
) {
  const document = await ctx.db.get(docId);
  if (
    !document ||
    document.organizationId !== organizationId ||
    document.deletedAt
  ) {
    throw notFoundError(organizationId, "document", docId);
  }
  return document;
}

async function audit(
  ctx: MutationCtx,
  organizationId: string,
  actorUserId: string,
  action: string,
  target: string,
  summary: string,
  createdAt: number,
) {
  await ctx.db.insert("organizationAuditEvents", {
    organizationId,
    actorUserId,
    action,
    target,
    summary,
    createdAt,
  });
}

async function assertInputFolderScope(
  ctx: Parameters<typeof requireFolder>[0],
  organizationId: string,
  input: { folderId?: string; projectId?: string },
  access: Awaited<ReturnType<typeof resolveDocumentAccess>>,
) {
  if (!input.folderId) return;
  const folder = await requireFolder(ctx, organizationId, input.folderId);
  await access.assertCanUpdateFolder(folder);
  access.assertMatchingScope(input, folder);
}

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: docInputValidator },
  returns: docValidator,
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    await access.assertCanCreateInProject(args.input.projectId);
    await assertInputFolderScope(ctx, args.organizationId, args.input, access);

    const now = Date.now();
    const id = await ctx.db.insert("docs", {
      organizationId: args.organizationId,
      ...args.input,
      visibility: args.input.visibility ?? "private",
      createdByUserId: access.actor.userId,
      createdAt: now,
      updatedAt: now,
    });
    const document = await requireDocument(ctx, args.organizationId, id);
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.doc.create",
      id,
      `Created doc "${args.input.title}".`,
      now,
    );
    return presentDoc(document);
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    docId: v.id("docs"),
    input: docInputValidator,
  },
  returns: docValidator,
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    const existing = await requireDocument(
      ctx,
      args.organizationId,
      args.docId,
    );
    await access.assertCanUpdateDocument(existing);
    const nextScope = {
      projectId: args.input.projectId ?? existing.projectId,
      folderId: args.input.folderId ?? existing.folderId,
    };
    await access.assertCanCreateInProject(nextScope.projectId);
    await assertInputFolderScope(ctx, args.organizationId, nextScope, access);

    const now = Date.now();
    await ctx.db.patch(args.docId, {
      ...args.input,
      visibility: args.input.visibility ?? existing.visibility ?? "private",
      updatedAt: now,
    });
    const document = await requireDocument(
      ctx,
      args.organizationId,
      args.docId,
    );
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.doc.update",
      args.docId,
      `Updated doc "${args.input.title}".`,
      now,
    );
    return presentDoc(document);
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), docId: v.id("docs") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    const existing = await requireDocument(
      ctx,
      args.organizationId,
      args.docId,
    );
    await access.assertCanUpdateDocument(existing);

    const now = Date.now();
    await ctx.db.patch(args.docId, { deletedAt: now, updatedAt: now });
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.doc.delete",
      args.docId,
      `Deleted doc "${existing.title}".`,
      now,
    );
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
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    const existing = await requireDocument(
      ctx,
      args.organizationId,
      args.docId,
    );
    await access.assertCanUpdateDocument(existing);

    if (args.folderId) {
      const folder = await requireFolder(
        ctx,
        args.organizationId,
        args.folderId,
      );
      await access.assertCanUpdateFolder(folder);
      access.assertMatchingScope(existing, folder);
    }

    const now = Date.now();
    await ctx.db.patch(args.docId, { folderId: args.folderId, updatedAt: now });
    const document = await requireDocument(
      ctx,
      args.organizationId,
      args.docId,
    );
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.doc.move",
      args.docId,
      `Moved doc "${existing.title}" to folder.`,
      now,
    );
    return presentDoc(document);
  },
});

export const createFolderFromHono = mutation({
  args: { organizationId: v.string(), input: docFolderInputValidator },
  returns: docFolderValidator,
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    await access.assertCanCreateInProject(args.input.projectId);
    if (args.input.parentId) {
      const parent = await requireFolder(
        ctx,
        args.organizationId,
        args.input.parentId,
      );
      await access.assertCanUpdateFolder(parent);
      access.assertMatchingScope(args.input, parent);
    }

    const now = Date.now();
    const id = await ctx.db.insert("docFolders", {
      organizationId: args.organizationId,
      ...args.input,
      createdByUserId: access.actor.userId,
      createdAt: now,
      updatedAt: now,
    });
    const folder = await requireFolder(ctx, args.organizationId, id);
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.docFolder.create",
      id,
      `Created folder "${args.input.name}".`,
      now,
    );
    return { ...folder, id: folder._id };
  },
});

export const renameFolderFromHono = mutation({
  args: {
    organizationId: v.string(),
    folderId: v.id("docFolders"),
    name: v.string(),
  },
  returns: docFolderValidator,
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    const existing = await requireFolder(
      ctx,
      args.organizationId,
      args.folderId,
    );
    await access.assertCanUpdateFolder(existing);

    const now = Date.now();
    await ctx.db.patch(args.folderId, { name: args.name, updatedAt: now });
    const folder = await requireFolder(ctx, args.organizationId, args.folderId);
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.docFolder.update",
      args.folderId,
      `Renamed folder to "${args.name}".`,
      now,
    );
    return { ...folder, id: folder._id };
  },
});

export const deleteFolderFromHono = mutation({
  args: { organizationId: v.string(), folderId: v.id("docFolders") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const access = await resolveDocumentAccess(ctx, args.organizationId);
    const existing = await requireFolder(
      ctx,
      args.organizationId,
      args.folderId,
    );
    await access.assertCanUpdateFolder(existing);

    const [childDocs, childFolders] = await Promise.all([
      ctx.db
        .query("docs")
        .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
        .take(MAX_FOLDER_CHILDREN + 1),
      ctx.db
        .query("docFolders")
        .withIndex("by_parent", (q) => q.eq("parentId", args.folderId))
        .take(MAX_FOLDER_CHILDREN + 1),
    ]);
    if (
      childDocs.length > MAX_FOLDER_CHILDREN ||
      childFolders.length > MAX_FOLDER_CHILDREN
    ) {
      throw childLimitError(args.organizationId, args.folderId);
    }

    const activeChildDocs = childDocs.filter(
      (document) =>
        document.organizationId === args.organizationId && !document.deletedAt,
    );
    const activeChildFolders = childFolders.filter(
      (folder) =>
        folder.organizationId === args.organizationId && !folder.deletedAt,
    );
    for (const document of activeChildDocs) {
      access.assertMatchingScope(existing, document);
      await access.assertCanUpdateDocument(document);
    }
    for (const folder of activeChildFolders) {
      access.assertMatchingScope(existing, folder);
      await access.assertCanUpdateFolder(folder);
    }

    const now = Date.now();
    await ctx.db.patch(args.folderId, { deletedAt: now, updatedAt: now });
    await Promise.all([
      ...activeChildDocs.map((document) =>
        ctx.db.patch(document._id, { folderId: undefined, updatedAt: now }),
      ),
      ...activeChildFolders.map((folder) =>
        ctx.db.patch(folder._id, { parentId: undefined, updatedAt: now }),
      ),
    ]);
    await audit(
      ctx,
      args.organizationId,
      access.actor.userId,
      "client.docFolder.delete",
      args.folderId,
      `Deleted folder "${existing.name}".`,
      now,
    );
    return { removed: true };
  },
});
