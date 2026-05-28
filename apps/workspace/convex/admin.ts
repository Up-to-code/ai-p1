import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  auditEventsForAdminRecord,
  detailRawForAdminDomainRecord,
  findAdminDomainRecord,
  listAdminDomain,
  runAdminDomainAction,
  summarizeAdminDomainRecord,
} from "./admin/domainAdapters";
import { assertAdminConvexServiceToken } from "./serviceTokens";

const adminDomainValidator = v.union(
  v.literal("organizations"),
  v.literal("users"),
  v.literal("apps"),
  v.literal("oauth-clients"),
  v.literal("partner-connections"),
  v.literal("api-keys"),
  v.literal("mcp-connections"),
  v.literal("webhooks"),
  v.literal("ai-activity"),
  v.literal("audit-logs"),
  v.literal("workspace-data"),
);

const adminActionValidator = v.union(
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("suspended"),
  v.literal("request_changes"),
  v.literal("reply"),
  v.literal("internal_note"),
  v.literal("pause"),
  v.literal("revoke"),
  v.literal("restore"),
  v.literal("archive"),
);

function assertAdminServiceToken(token: string) {
  assertAdminConvexServiceToken(token);
}

export const listDomain = query({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    return listAdminDomain(ctx, args);
  },
});

export const getDomainRecord = query({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    id: v.string(),
    actorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    const record = await findAdminDomainRecord(ctx, args.domain, args.id);
    if (!record) return null;
    return {
      record: summarizeAdminDomainRecord(args.domain, record),
      raw: await detailRawForAdminDomainRecord(ctx, args.domain, record),
      auditTimeline: auditEventsForAdminRecord(record, args.actorEmail ?? "admin"),
    };
  },
});

export const runDomainAction = mutation({
  args: {
    adminServiceToken: v.string(),
    domain: adminDomainValidator,
    id: v.string(),
    actionId: adminActionValidator,
    reason: v.optional(v.string()),
    partnerReply: v.optional(v.string()),
    internalNote: v.optional(v.string()),
    actorEmail: v.string(),
  },
  handler: async (ctx, args) => {
    assertAdminServiceToken(args.adminServiceToken);
    return runAdminDomainAction(ctx, args);
  },
});
