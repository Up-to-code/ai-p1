const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 15 * 60_000;
export const MAX_SEARCH_OUTBOX_ATTEMPTS = 8;

export function failedOutboxState(attempts: number, now: number, error: string) {
  const nextAttempts = attempts + 1;
  const deadLetter = nextAttempts >= MAX_SEARCH_OUTBOX_ATTEMPTS;
  return {
    status: deadLetter ? "dead_letter" as const : "pending" as const,
    attempts: nextAttempts,
    nextAttemptAt: deadLetter ? now : now + Math.min(BASE_RETRY_MS * 2 ** Math.max(0, nextAttempts - 1), MAX_RETRY_MS),
    lastError: error.slice(0, 2_000),
    claimedAt: undefined,
    updatedAt: now,
  };
}
