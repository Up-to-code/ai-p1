import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { assertMediaResource, listLimit, listCursor, requiredString, optionalString, optionalNumber, mediaKind } from "../toolInputs";
import { mcpPublicMediaPage } from "../readSurface";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  TOOL_SCAN_LIMIT, assertConnectionPermission, mediaResourcePermission, audit,
} from "./shared";
import { scopeActorUserId } from "../scopePolicy";

export const mediaList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const resourceType = requiredString(args.input, "resourceType") as "project" | "client" | "calendarEvent" | "task";
  assertConnectionPermission(args.permissions, mediaResourcePermission(resourceType), "read");
  const page = await ctx.db
    .query("mediaAssets")
    .withIndex("by_organization_resource", (q) =>
      q
        .eq("organizationId", args.organizationId)
        .eq("resourceType", resourceType)
        .eq("resourceId", requiredString(args.input, "resourceId")),
    )
    .paginate({ numItems: limit, cursor: listCursor(args.input) });
  return mcpPublicMediaPage(page);
};

export const mediaAttachUrl: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  await assertMediaResource(ctx, args.organizationId, args.input);
  const resourceType = requiredString(args.input, "resourceType") as "project" | "client" | "calendarEvent" | "task";
  assertConnectionPermission(args.permissions, mediaResourcePermission(resourceType), "update");
  const resourceId = requiredString(args.input, "resourceId");
  const existing = await ctx.db
    .query("mediaAssets")
    .withIndex("by_organization_resource", (q) => q.eq("organizationId", args.organizationId).eq("resourceType", resourceType).eq("resourceId", resourceId))
    .take(TOOL_SCAN_LIMIT);
  const id = await ctx.db.insert("mediaAssets", {
    organizationId: args.organizationId,
    key: `external:${requiredString(args.input, "url")}`,
    url: requiredString(args.input, "url"),
    name: requiredString(args.input, "name"),
    mimeType: optionalString(args.input, "mimeType") ?? "application/octet-stream",
    size: optionalNumber(args.input, "size") ?? 0,
    kind: mediaKind(args.input),
    resourceType,
    resourceId,
    sortOrder: existing.length,
    shareVisibility: "private",
    isCover: false,
    createdByUserId: scopeActorUserId(args.scopePolicy),
    createdAt: args.now,
    updatedAt: args.now,
  });
  await audit(ctx, args.organizationId, args.connectionId, `${resourceType}.media.attach`, resourceId, `Attached ${requiredString(args.input, "name")}.`);
  return (await ctx.db.get(id))!;
};
