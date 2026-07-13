import type { MutationCtx } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { requiredString, requiredNumber, optionalString, optionalNumber } from "../toolInputs";
import { type WriteHandler, type WriteToolArgs, audit } from "./shared";
import { scopeActorUserId } from "../scopePolicy";

export const notificationsSchedule: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const actorId = scopeActorUserId(args.scopePolicy);
  const id = await ctx.db.insert("notificationSchedules", {
    organizationId: args.organizationId,
    ownerUserId: actorId,
    title: requiredString(args.input, "title"),
    body: requiredString(args.input, "body"),
    category: (optionalString(args.input, "category") as "calendar" | "task" | "manual" | "organization") ?? "manual",
    scheduledAt: requiredNumber(args.input, "scheduledAt"),
    timezone: optionalString(args.input, "timezone"),
    recurrence: args.input.recurrence as { frequency: "daily" | "weekly" | "monthly"; interval: number; untilAt?: number } | undefined,
    status: "active",
    createdByUserId: actorId,
    updatedByUserId: actorId,
    createdAt: args.now,
    updatedAt: args.now,
  });
  await audit(ctx, args.organizationId, args.connectionId, "notification.schedule", id, `Scheduled notification: ${requiredString(args.input, "title")}.`);
  return (await ctx.db.get(id))!;
};

export const notificationsUpdateSchedule: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const actorId = scopeActorUserId(args.scopePolicy);
  const scheduleId = requiredString(args.input, "scheduleId") as Id<"notificationSchedules">;
  const existing = await ctx.db.get(scheduleId);
  if (!existing || existing.organizationId !== args.organizationId || existing.ownerUserId !== actorId) {
    throw new Error("Notification schedule was not found.");
  }
  await ctx.db.patch(scheduleId, {
    title: optionalString(args.input, "title") ?? existing.title,
    body: optionalString(args.input, "body") ?? existing.body,
    category: (optionalString(args.input, "category") as "calendar" | "task" | "manual" | "organization") ?? existing.category,
    scheduledAt: optionalNumber(args.input, "scheduledAt") ?? existing.scheduledAt,
    timezone: optionalString(args.input, "timezone") ?? existing.timezone,
    recurrence: (args.input.recurrence as typeof existing.recurrence) ?? existing.recurrence,
    status: "active",
    updatedByUserId: actorId,
    updatedAt: args.now,
  });
  await audit(ctx, args.organizationId, args.connectionId, "notification.schedule.update", scheduleId, `Updated notification schedule.`);
  return (await ctx.db.get(scheduleId))!;
};

export const notificationsCancelSchedule: WriteHandler = async (ctx: MutationCtx, args: WriteToolArgs) => {
  const actorId = scopeActorUserId(args.scopePolicy);
  const scheduleId = requiredString(args.input, "scheduleId") as Id<"notificationSchedules">;
  const existing = await ctx.db.get(scheduleId);
  if (!existing || existing.organizationId !== args.organizationId || existing.ownerUserId !== actorId) {
    throw new Error("Notification schedule was not found.");
  }
  await ctx.db.patch(scheduleId, {
    status: "canceled",
    updatedByUserId: actorId,
    updatedAt: args.now,
    canceledAt: args.now,
  });
  await audit(ctx, args.organizationId, args.connectionId, "notification.schedule.cancel", scheduleId, `Canceled notification schedule.`);
  return { canceled: true };
};
