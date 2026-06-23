import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeWorkspaceRows, boundedWorkspaceReadLimit } from "../workspace/readSurface";
import { docValidator, docFolderValidator } from "./validators";

const MAX_LIST_DOCS = 500;

function presentDoc<TDoc extends { _id: string; visibility?: "private" | "team" | "workspace" }>(doc: TDoc) {
  return { ...doc, id: doc._id, visibility: doc.visibility ?? "private" };
}

export const list = query({
  args: { organizationId: v.string(), projectId: v.optional(v.string()) },
  returns: v.array(docValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    const docs = args.projectId
      ? await ctx.db
          .query("docs")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", args.organizationId).eq("projectId", args.projectId!),
          )
          .take(MAX_LIST_DOCS)
      : await ctx.db
          .query("docs")
          .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_DOCS);

    return activeWorkspaceRows(docs).map(presentDoc);
  },
});

export const listByFolder = query({
  args: { organizationId: v.string(), folderId: v.string() },
  returns: v.array(docValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const docs = await ctx.db
      .query("docs")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .take(MAX_LIST_DOCS);

    return activeWorkspaceRows(docs)
      .filter((doc) => doc.organizationId === args.organizationId)
      .map(presentDoc);
  },
});

export const get = query({
  args: { organizationId: v.string(), docId: v.id("docs") },
  returns: v.union(docValidator, v.null()),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const doc = await ctx.db.get(args.docId);
    if (!doc || doc.organizationId !== args.organizationId || doc.deletedAt) return null;
    return presentDoc(doc);
  },
});

export const search = query({
  args: { organizationId: v.string(), query: v.string(), projectId: v.optional(v.string()) },
  returns: v.array(docValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const needle = args.query.trim().toLowerCase();
    if (!needle) return [];

    const docs = args.projectId
      ? await ctx.db
          .query("docs")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", args.organizationId).eq("projectId", args.projectId!),
          )
          .take(MAX_LIST_DOCS)
      : await ctx.db
          .query("docs")
          .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
          .take(MAX_LIST_DOCS);

    return activeWorkspaceRows(docs)
      .filter((doc) => {
        const haystack = [doc.title, doc.content, ...(doc.tags ?? [])];
        return haystack.some((v) => v?.toLowerCase().includes(needle));
      })
      .map(presentDoc);
  },
});

export const folderTree = query({
  args: { organizationId: v.string(), projectId: v.optional(v.string()) },
  returns: v.array(docFolderValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    const folders = args.projectId
      ? await ctx.db
          .query("docFolders")
          .withIndex("by_organization_project", (q) =>
            q.eq("organizationId", args.organizationId).eq("projectId", args.projectId!),
          )
          .take(200)
      : await ctx.db
          .query("docFolders")
          .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
          .take(200);

    return activeWorkspaceRows(folders).map((f) => ({ ...f, id: f._id }));
  },
});
