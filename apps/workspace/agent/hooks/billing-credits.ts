import { fetchMutation } from "convex/nextjs";
import { defineHook } from "eve/hooks";
import { api } from "../../convex/_generated/api";
import { requireWorkspaceActor, requireWorkspaceActorToken } from "../lib/workspace-actor";

const maximumCreditsPerTurn = Math.max(1, Number(process.env.EVE_MAX_CREDITS_PER_TURN ?? 1_000));
const modelId = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-nano";

function runKey(sessionId: string, turnId: string) {
  return `${sessionId}:${turnId}`;
}

export default defineHook({
  events: {
    async "turn.started"(event, ctx) {
      const actor = requireWorkspaceActor(ctx);
      const token = requireWorkspaceActorToken(ctx, "convexToken");
      const result = await fetchMutation(api.billing.credits.reserveAiCredits, {
        organizationId: actor.organizationId,
        runKey: runKey(ctx.session.id, event.data.turnId),
        threadId: ctx.session.id,
        modelId,
        maximumCredits: maximumCreditsPerTurn,
      }, { token });
      if (!result.allowed) {
        const error = new Error(result.reason === "AI_UNAVAILABLE"
          ? "AI is unavailable on this organization plan. Upgrade to Unlimited or Business."
          : "The organization does not have enough AI credits. Purchase an AI credit card to continue.");
        error.name = result.reason ?? "AI_CREDIT_AUTHORIZATION_FAILED";
        throw error;
      }
    },
    async "step.completed"(event, ctx) {
      const actor = requireWorkspaceActor(ctx);
      const token = requireWorkspaceActorToken(ctx, "convexToken");
      await fetchMutation(api.billing.credits.recordAiStepUsage, {
        organizationId: actor.organizationId,
        runKey: runKey(ctx.session.id, event.data.turnId),
        promptTokens: event.data.usage?.inputTokens,
        completionTokens: event.data.usage?.outputTokens,
      }, { token });
    },
    async "turn.completed"(event, ctx) {
      const actor = requireWorkspaceActor(ctx);
      const token = requireWorkspaceActorToken(ctx, "convexToken");
      await fetchMutation(api.billing.credits.settleAiCredits, {
        organizationId: actor.organizationId,
        runKey: runKey(ctx.session.id, event.data.turnId),
      }, { token });
    },
    async "turn.failed"(event, ctx) {
      const actor = requireWorkspaceActor(ctx);
      const token = requireWorkspaceActorToken(ctx, "convexToken");
      await fetchMutation(api.billing.credits.releaseAiCredits, {
        organizationId: actor.organizationId,
        runKey: runKey(ctx.session.id, event.data.turnId),
      }, { token });
    },
  },
});
