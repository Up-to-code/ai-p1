import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord, assertPublicWorkspaceRecord } from "../../workspace/businessData";
import { dealInput, listLimit, listCursor, requiredString, searchTerm, optionalString, assertDealLinks } from "../toolInputs";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  hasInputKey, scopedProjectId, scopedClientId, dealSearchValues, audit,
} from "./shared";
import { isScopedProject, scopeActorUserId, scopePolicyFromInput } from "../scopePolicy";

export const dealsList: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const limit = listLimit(args.input);
  const search = searchTerm(args.input);
  const projectId = scopedProjectId(args.input) as Id<"projects"> | undefined;
  const clientId = scopedClientId(args.input) as Id<"clients"> | undefined;
  const stage = optionalString(args.input, "stage") as "lead" | "qualified" | "proposal_sent" | "contract_sent" | "won" | "lost" | undefined;
  const status = optionalString(args.input, "status") as "open" | "won" | "lost" | "paused" | undefined;
  const scope = scopePolicyFromInput(args.input);
  if (scope.scopeType !== "organization") {
    const deals = await ctx.db
      .query("deals")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .take(200);
    return {
      items: deals
        .filter((deal) => !deal.deletedAt && deal.recordState !== "deleted" && isScopedProject(scope, deal.projectId))
        .filter((deal) => !stage || deal.stage === stage)
        .filter((deal) => !status || deal.status === status)
        .filter((deal) => !search || dealSearchValues(deal).some((value) => value.toLowerCase().includes(search)))
        .slice(0, limit)
        .map(presentWorkspaceRecord),
      isDone: true,
      continueCursor: "",
    };
  }
  const query = hasInputKey(args.input, "projectId")
    ? ctx.db
        .query("deals")
        .withIndex("by_project", (q) => q.eq("organizationId", args.organizationId).eq("projectId", projectId))
    : clientId
      ? ctx.db
          .query("deals")
          .withIndex("by_client", (q) => q.eq("organizationId", args.organizationId).eq("clientId", clientId))
      : stage
        ? ctx.db
            .query("deals")
            .withIndex("by_organization_stage", (q) => q.eq("organizationId", args.organizationId).eq("stage", stage))
        : status
          ? ctx.db
              .query("deals")
              .withIndex("by_organization_status", (q) => q.eq("organizationId", args.organizationId).eq("status", status))
          : ctx.db
              .query("deals")
              .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId));
  const page = await query.paginate({ numItems: limit, cursor: listCursor(args.input) });
  return {
    items: page.page
      .filter((deal) => !deal.deletedAt)
      .filter((deal) => !stage || deal.stage === stage)
      .filter((deal) => !status || deal.status === status)
      .filter((deal) => !search || dealSearchValues(deal).some((value) => value.toLowerCase().includes(search)))
      .map(presentWorkspaceRecord),
    isDone: page.isDone,
    continueCursor: page.continueCursor,
  };
};

export const dealsGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const deal = await ctx.db.get(requiredString(args.input, "dealId") as Id<"deals">);
  if (deal && (!isScopedProject(scopePolicyFromInput(args.input), deal.projectId) || deal.recordState === "deleted")) throw new Error("Deal was not found.");
  return presentWorkspaceRecord(assertActiveWorkspaceRecord(deal, args.organizationId, "Deal"));
};

export const dealsCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const deal = dealInput(args.input);
  await assertDealLinks(ctx, args.organizationId, deal);
  const result = await ctx.runMutation(internal.deals.write.createInternal, {
    organizationId: args.organizationId,
    input: deal,
    actorUserId: scopeActorUserId(args.input),
  });
  await audit(ctx, args.organizationId, args.connectionId, "deal.create", result.id, `Created deal ${deal.title}.`);
  return presentWorkspaceRecord(result);
};

export const dealsUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const dealId = requiredString(args.input, "dealId") as Id<"deals">;
  const existing = assertActiveWorkspaceRecord(await ctx.db.get(dealId), args.organizationId, "Deal");
  const parsed = dealInput(args.input);
  const patch = {
    ...parsed,
    projectId: Object.prototype.hasOwnProperty.call(args.input, "projectId") ? parsed.projectId : existing.projectId,
    clientId: Object.prototype.hasOwnProperty.call(args.input, "clientId") ? parsed.clientId : existing.clientId,
  };
  await assertDealLinks(ctx, args.organizationId, patch);
  const result = await ctx.runMutation(internal.deals.write.updateInternal, {
    organizationId: args.organizationId,
    dealId,
    input: patch,
    actorUserId: scopeActorUserId(args.input),
  });
  await audit(ctx, args.organizationId, args.connectionId, "deal.update", dealId, `Updated deal.`);
  return presentWorkspaceRecord(result);
};

export const dealsDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const dealId = requiredString(args.input, "dealId") as Id<"deals">;
  const result = await ctx.runMutation(internal.deals.write.deleteInternal, {
    organizationId: args.organizationId,
    dealId,
    actorUserId: scopeActorUserId(args.input),
  });
  await audit(ctx, args.organizationId, args.connectionId, "deal.delete", dealId, `Deleted deal.`);
  return result;
};
