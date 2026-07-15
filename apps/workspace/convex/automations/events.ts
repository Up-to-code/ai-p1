import type { MutationCtx } from "../_generated/server";

export async function emitAutomationEvent(ctx: MutationCtx, input: { organizationId: string; eventType: string; resourceType: string; resourceId: string; payload?: Record<string, string>; actorUserId: string }) {
  const now = Date.now();
  return ctx.db.insert("automationEvents", { ...input, payload: input.payload ?? {}, occurredAt: now, status: "pending", attempts: 0, nextAttemptAt: now });
}
