import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { assertOrganizationResourcePermission } from "./organizations/profile/access";
import { activeUpdatedWorkspaceRows, boundedWorkspaceReadLimit } from "./workspace/readSurface";
import { clerkAuthComponent } from "./auth";

type PipelineConfig = {
  tableName: string;
  auditPrefix: string;
  stageValidator: any;
  inputValidator: any;
  outputValidator: any;
  searchFields: string[];
  maxList: number;
};

function present(record: any) {
  return { ...record, id: record._id };
}

function matchesSearch(record: any, searchFields: string[], search?: string) {
  const q = search?.trim().toLowerCase();
  if (!q) return true;
  return searchFields.some((field) => {
    const value = record[field];
    return typeof value === "string" && value.toLowerCase().includes(q);
  });
}

export function createPipelineList(config: PipelineConfig) {
  return query({
    args: {
      organizationId: v.string(),
      stage: v.optional(config.stageValidator),
      search: v.optional(v.string()),
      limit: v.optional(v.number()),
    },
    returns: v.array(config.outputValidator),
    handler: async (ctx: any, args: any) => {
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
      const limit = boundedWorkspaceReadLimit(args.limit, config.maxList, config.maxList);
      const records = args.stage
        ? await ctx.db
            .query(config.tableName)
            .withIndex("by_organization_stage", (q: any) => q.eq("organizationId", args.organizationId).eq("stage", args.stage))
            .take(limit)
        : await ctx.db
            .query(config.tableName)
            .withIndex("by_organization_id", (q: any) => q.eq("organizationId", args.organizationId))
            .take(limit);

      return activeUpdatedWorkspaceRows(records)
        .filter((record: any) => matchesSearch(record, config.searchFields, args.search))
        .map((record: any) => present(record));
    },
  });
}

export function createPipelineGet(config: PipelineConfig) {
  return query({
    args: { organizationId: v.string(), recordId: v.id(config.tableName) },
    returns: v.union(config.outputValidator, v.null()),
    handler: async (ctx: any, args: any) => {
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
      const record = await ctx.db.get(args.recordId);
      if (!record || record.organizationId !== args.organizationId || record.deletedAt) return null;
      return present(record);
    },
  });
}

export function createPipelineOptions(config: PipelineConfig) {
  return query({
    args: { organizationId: v.string(), limit: v.optional(v.number()) },
    returns: v.array(v.object({ id: v.string(), title: v.string() })),
    handler: async (ctx: any, args: any) => {
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
      const limit = boundedWorkspaceReadLimit(args.limit, 100, 200);
      const records = await ctx.db
        .query(config.tableName)
        .withIndex("by_organization_id", (q: any) => q.eq("organizationId", args.organizationId))
        .take(limit);

      return activeUpdatedWorkspaceRows(records).map((record: any) => ({
        id: record._id,
        title: record.title,
      }));
    },
  });
}

export function createPipelineStats(config: PipelineConfig, statsFields: { valueField: string }) {
  return query({
    args: { organizationId: v.string() },
    returns: v.object({
      total: v.number(),
      open: v.number(),
      qualified: v.number(),
      won: v.number(),
      lost: v.number(),
      [statsFields.valueField]: v.number(),
    }),
    handler: async (ctx: any, args: any) => {
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
      const records = activeUpdatedWorkspaceRows(await ctx.db
        .query(config.tableName)
        .withIndex("by_organization_id", (q: any) => q.eq("organizationId", args.organizationId))
        .take(config.maxList));

      return {
        total: records.length,
        open: records.filter((r: any) => r.status === "open").length,
        qualified: records.filter((r: any) => r.stage === "qualified").length,
        won: records.filter((r: any) => r.status === "won").length,
        lost: records.filter((r: any) => r.status === "lost").length,
        [statsFields.valueField]: records.reduce((sum: number, r: any) => sum + (r.value ?? 0), 0),
      };
    },
  });
}

export function createPipelineCreate(config: PipelineConfig) {
  return mutation({
    args: { organizationId: v.string(), input: config.inputValidator },
    returns: config.outputValidator,
    handler: async (ctx: any, args: any) => {
      const user = await clerkAuthComponent.getAuthUser(ctx);
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
      const now = Date.now();
      const ownerUserId = args.input.ownerUserId ?? user._id;
      const id = await ctx.db.insert(config.tableName, {
        organizationId: args.organizationId,
        ...args.input,
        ownerUserId,
        createdByUserId: user._id,
        createdAt: now,
        updatedAt: now,
        ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: now } : {}),
      });

      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: user._id,
        action: `${config.auditPrefix}.create`,
        target: id,
        summary: `Created ${config.auditPrefix} ${args.input.title}.`,
        createdAt: now,
      });

      const record = await ctx.db.get(id);
      if (!record) throw new Error(`${config.auditPrefix} could not be created.`);
      return present(record);
    },
  });
}

export function createPipelineUpdate(config: PipelineConfig) {
  return mutation({
    args: { organizationId: v.string(), recordId: v.id(config.tableName), input: config.inputValidator },
    returns: config.outputValidator,
    handler: async (ctx: any, args: any) => {
      const user = await clerkAuthComponent.getAuthUser(ctx);
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
      const existing = await ctx.db.get(args.recordId);
      if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error(`${config.auditPrefix} was not found.`);
      const now = Date.now();
      const patch = {
        ...args.input,
        ownerUserId: args.input.ownerUserId ?? existing.ownerUserId,
        updatedAt: now,
        ...(args.input.status === "won" || args.input.status === "lost" ? { closedAt: existing.closedAt ?? now } : {}),
      };
      await ctx.db.patch(args.recordId, patch);

      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: user._id,
        action: `${config.auditPrefix}.update`,
        target: args.recordId,
        summary: `Updated ${config.auditPrefix} ${args.input.title}.`,
        createdAt: now,
      });

      const record = await ctx.db.get(args.recordId);
      if (!record) throw new Error(`${config.auditPrefix} was not found.`);
      return present(record);
    },
  });
}

export function createPipelineDelete(config: PipelineConfig) {
  return mutation({
    args: { organizationId: v.string(), recordId: v.id(config.tableName) },
    returns: v.object({ removed: v.boolean() }),
    handler: async (ctx: any, args: any) => {
      const user = await clerkAuthComponent.getAuthUser(ctx);
      await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
      const existing = await ctx.db.get(args.recordId);
      if (!existing || existing.organizationId !== args.organizationId || existing.deletedAt) throw new Error(`${config.auditPrefix} was not found.`);
      const now = Date.now();
      await ctx.db.patch(args.recordId, { deletedAt: now, isDeleted: true, updatedAt: now });
      await ctx.db.insert("organizationAuditEvents", {
        organizationId: args.organizationId,
        actorUserId: user._id,
        action: `${config.auditPrefix}.delete`,
        target: args.recordId,
        summary: `Deleted ${config.auditPrefix} ${existing.title}.`,
        createdAt: now,
      });
      return { removed: true };
    },
  });
}
