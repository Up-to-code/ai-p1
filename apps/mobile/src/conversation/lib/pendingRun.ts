export const ASSISTANT_PENDING_TIMEOUT_MS = 45_000;

export function hasPendingRunTimedOut(
  pendingStartedAt: number | null,
  now: number = Date.now(),
  timeoutMs: number = ASSISTANT_PENDING_TIMEOUT_MS,
) {
  if (!pendingStartedAt) {
    return false;
  }

  return now - pendingStartedAt >= timeoutMs;
}

export function shouldResolveCompletedRunWithoutAssistant(
  pendingPrompt: string | null,
  hasCompletedAssistant: boolean,
  runStatus: string | null | undefined,
) {
  return Boolean(pendingPrompt) && !hasCompletedAssistant && runStatus === "completed";
}
