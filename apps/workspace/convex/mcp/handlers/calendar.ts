import type { QueryCtx, MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { internal } from "../../_generated/api";
import { presentWorkspaceRecord } from "../../shared/present";
import { assertActiveWorkspaceRecord } from "../../workspace/businessData";
import { calendarInput, listLimit, listCursor, requiredString, requiredNumber, optionalString, assertCalendarLinks } from "../toolInputs";
import {
  type ReadHandler, type WriteHandler, type ReadToolArgs, type WriteToolArgs,
  listEvents, audit,
} from "./shared";

export const calendarListToday: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const end = start + 24 * 60 * 60 * 1000;
  return listEvents(ctx, args.organizationId, start, end, listLimit(args.input), listCursor(args.input), optionalString(args.input, "spaceId"));
};

export const calendarListRange: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  return listEvents(ctx, args.organizationId, requiredNumber(args.input, "startAt"), requiredNumber(args.input, "endAt"), listLimit(args.input), listCursor(args.input), optionalString(args.input, "spaceId"));
};

export const calendarListMonth: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const year = requiredNumber(args.input, "year");
  const month = requiredNumber(args.input, "month");
  const start = Date.UTC(year, month - 1, 1);
  const end = Date.UTC(year, month, 1);
  return listEvents(ctx, args.organizationId, start, end, listLimit(args.input), listCursor(args.input), optionalString(args.input, "spaceId"));
};

export const calendarGet: ReadHandler = async (ctx: QueryCtx, args: ReadToolArgs) => {
  const event = await ctx.db.get(requiredString(args.input, "eventId") as Id<"calendarEvents">);
  return presentWorkspaceRecord(assertActiveWorkspaceRecord(event, args.organizationId, "Calendar event"));
};

export const calendarCreate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const event = calendarInput(args.input);
  await assertCalendarLinks(ctx, args.organizationId, event);
  const result = await ctx.runMutation(internal.calendar.write.createInternal, {
    organizationId: args.organizationId,
    input: event,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.create", result.id, `Scheduled ${event.title}.`);
  return presentWorkspaceRecord(result);
};

export const calendarUpdate: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const eventId = requiredString(args.input, "eventId") as Id<"calendarEvents">;
  const patch = calendarInput(args.input);
  await assertCalendarLinks(ctx, args.organizationId, patch);
  const result = await ctx.runMutation(internal.calendar.write.updateInternal, {
    organizationId: args.organizationId,
    eventId,
    input: patch,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.update", eventId, `Updated.`);
  return presentWorkspaceRecord(result);
};

export const calendarDelete: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const eventId = requiredString(args.input, "eventId") as Id<"calendarEvents">;
  const result = await ctx.runMutation(internal.calendar.write.deleteInternal, {
    organizationId: args.organizationId,
    eventId,
    actorUserId: args.actorId,
  });
  await audit(ctx, args.organizationId, args.connectionId, "calendar.delete", eventId, `Deleted.`);
  return result;
};
