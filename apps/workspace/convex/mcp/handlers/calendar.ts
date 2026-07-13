import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord } from "../../workspace/businessData";
import { calendarInput, calendarPatchInput, listLimit, listCursor, requiredString, requiredNumber, optionalString } from "../toolInputs";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  listEvents, audit,
} from "./shared";
import { isScopedResourceLink, scopeActorUserId } from "../scopePolicy";

async function scopedListEvents(ctx: QueryCtx, args: ReadToolArgs, startAt: number, endAt: number) {
  const scope = args.scopePolicy;
  if (scope.scopeType === "organization") {
    return listEvents(ctx, args.organizationId, startAt, endAt, listLimit(args.input), listCursor(args.input), optionalString(args.input, "spaceId"));
  }
  const events = await ctx.db
    .query("calendarEvents")
    .withIndex("by_start", (q) => q.eq("organizationId", args.organizationId).gte("startAt", startAt).lt("startAt", endAt))
    .take(200);
  const page = events
    .filter((event) => event.recordState !== "deleted" && isScopedResourceLink(scope, event))
    .slice(0, listLimit(args.input));
  return listEventsResult(page);
}

function listEventsResult(page: Array<{ _id: string; deletedAt?: number; startAt: number } & Record<string, unknown>>) {
  return {
    items: page.filter((event) => !event.deletedAt).sort((a, b) => a.startAt - b.startAt).map(presentWorkspaceRecord),
    isDone: true,
    continueCursor: "",
  };
}

export const calendarListToday: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const end = start + 24 * 60 * 60 * 1000;
  return scopedListEvents(ctx, args, start, end);
};

export const calendarListRange: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  return scopedListEvents(ctx, args, requiredNumber(args.input, "startAt"), requiredNumber(args.input, "endAt"));
};

export const calendarListMonth: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const year = requiredNumber(args.input, "year");
  const month = requiredNumber(args.input, "month");
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
  return scopedListEvents(ctx, args, start, end);
};

export const calendarGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const event = await ctx.db.get(requiredString(args.input, "eventId") as Id<"calendarEvents">);
  const scope = args.scopePolicy;
  if (event && (!isScopedResourceLink(scope, event) || event.recordState === "deleted")) throw new Error("Calendar event was not found.");
  return presentWorkspaceRecord(assertActiveWorkspaceRecord(event, args.organizationId, "Calendar event"));
};

export const calendarCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const event = calendarInput(args.input);
  if (!isScopedResourceLink(args.scopePolicy, event)) {
    throw new Error("Calendar event is outside the granted scope.");
  }
  const result = await ctx.runMutation(internal.calendar.write.createInternal, {
    organizationId: args.organizationId,
    input: event,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.create", result.id, `Scheduled ${event.title}.`);
  return presentWorkspaceRecord(result);
};

export const calendarUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const eventId = requiredString(args.input, "eventId") as Id<"calendarEvents">;
  const existing = assertActiveWorkspaceRecord(
    await ctx.db.get(eventId),
    args.organizationId,
    "Calendar event",
  );
  if (!isScopedResourceLink(args.scopePolicy, existing)) {
    throw new Error("Calendar event was not found.");
  }
  const patch = calendarPatchInput(args.input);
  if (!isScopedResourceLink(args.scopePolicy, { ...existing, ...patch })) {
    throw new Error("Calendar event is outside the granted scope.");
  }
  const result = await ctx.runMutation(internal.calendar.write.updateInternal, {
    organizationId: args.organizationId,
    eventId,
    input: patch,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.update", eventId, `Updated.`);
  return presentWorkspaceRecord(result);
};

export const calendarDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const eventId = requiredString(args.input, "eventId") as Id<"calendarEvents">;
  const result = await ctx.runMutation(internal.calendar.write.deleteInternal, {
    organizationId: args.organizationId,
    eventId,
    actorUserId: scopeActorUserId(args.scopePolicy),
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.delete", eventId, `Deleted.`);
  return result;
};
