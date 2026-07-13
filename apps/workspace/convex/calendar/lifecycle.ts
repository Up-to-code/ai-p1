import type { Infer } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  cancelQueuedJobsForSource,
  scheduleCalendarEventReminders,
} from "../notifications/helpers";
import { presentCalendarEvent } from "./presentation";
import {
  calendarEventInputValidator,
  calendarEventPatchValidator,
} from "./validators";

export type CalendarEventInput = Infer<typeof calendarEventInputValidator>;
export type CalendarEventPatch = Infer<typeof calendarEventPatchValidator>;
type CalendarLifecycleContext = Pick<MutationCtx, "db" | "scheduler">;
type CalendarIdentity = Readonly<{ organizationId: string; actorUserId: string }>;

function assertTimeRange(event: Pick<CalendarEventInput, "startAt" | "endAt">) {
  if (!Number.isFinite(event.startAt) || !Number.isFinite(event.endAt) || event.endAt < event.startAt) {
    throw new Error("Event end must not be before its start.");
  }
}

async function requireActiveEvent(
  ctx: CalendarLifecycleContext,
  organizationId: string,
  eventId: Id<"calendarEvents">,
) {
  const event = await ctx.db.get(eventId);
  if (!event || event.organizationId !== organizationId || event.deletedAt) {
    throw new Error("Calendar event was not found.");
  }
  return event;
}

async function assertEventLinks(
  ctx: CalendarLifecycleContext,
  organizationId: string,
  input: CalendarEventInput,
) {
  const links = [
    input.clientId ? ["clients", input.clientId, "Client"] as const : null,
    input.projectId ? ["projects", input.projectId, "Project"] as const : null,
    input.taskId ? ["tasks", input.taskId, "Task"] as const : null,
    input.documentId ? ["docs", input.documentId, "Document"] as const : null,
  ].filter((link): link is NonNullable<typeof link> => Boolean(link));

  for (const [table, id, label] of links) {
    const record = await ctx.db.get(id as Id<typeof table>);
    if (!record || record.organizationId !== organizationId || record.deletedAt) {
      throw new Error(`${label} was not found in this organization.`);
    }
  }
}

async function appendAudit(
  ctx: CalendarLifecycleContext,
  input: CalendarIdentity & { action: string; target: string; summary: string; createdAt: number },
) {
  await ctx.db.insert("organizationAuditEvents", input);
}

export async function createCalendarEvent(
  ctx: CalendarLifecycleContext,
  args: CalendarIdentity & { input: CalendarEventInput },
) {
  assertTimeRange(args.input);
  await assertEventLinks(ctx, args.organizationId, args.input);
  const now = Date.now();
  const id = await ctx.db.insert("calendarEvents", {
    organizationId: args.organizationId,
    ...args.input,
    recordState: "active",
    createdByUserId: args.actorUserId,
    createdAt: now,
    updatedAt: now,
  });
  const event = await requireActiveEvent(ctx, args.organizationId, id);
  await scheduleCalendarEventReminders(ctx as MutationCtx, event);
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "calendar.create",
    target: id,
    summary: `Scheduled ${args.input.title}.`,
    createdAt: now,
  });
  return presentCalendarEvent(event);
}

export async function updateCalendarEvent(
  ctx: CalendarLifecycleContext,
  args: CalendarIdentity & { eventId: Id<"calendarEvents">; input: CalendarEventPatch },
) {
  if (Object.keys(args.input).length === 0) {
    throw new Error("At least one calendar event field is required.");
  }
  const existing = await requireActiveEvent(ctx, args.organizationId, args.eventId);
  const merged = { ...existing, ...args.input } as Doc<"calendarEvents">;
  assertTimeRange(merged);
  await assertEventLinks(ctx, args.organizationId, merged);
  const now = Date.now();
  await ctx.db.patch(args.eventId, { ...args.input, updatedAt: now });
  const event = await requireActiveEvent(ctx, args.organizationId, args.eventId);
  await scheduleCalendarEventReminders(ctx as MutationCtx, event);
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "calendar.update",
    target: args.eventId,
    summary: `Updated ${event.title}.`,
    createdAt: now,
  });
  return presentCalendarEvent(event);
}

export async function deleteCalendarEvent(
  ctx: CalendarLifecycleContext,
  args: CalendarIdentity & { eventId: Id<"calendarEvents"> },
) {
  const existing = await requireActiveEvent(ctx, args.organizationId, args.eventId);
  const now = Date.now();
  await ctx.db.patch(args.eventId, {
    deletedAt: now,
    recordState: "deleted",
    updatedAt: now,
  });
  await cancelQueuedJobsForSource(
    ctx as MutationCtx,
    args.organizationId,
    "calendarEvent",
    args.eventId,
  );
  await appendAudit(ctx, {
    organizationId: args.organizationId,
    actorUserId: args.actorUserId,
    action: "calendar.delete",
    target: args.eventId,
    summary: `Deleted ${existing.title}.`,
    createdAt: now,
  });
  return { removed: true as const };
}
