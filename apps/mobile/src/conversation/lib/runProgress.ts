export const ASSISTANT_PENDING_TIMEOUT_MS = 45_000;
export const ASSISTANT_PENDING_MAX_TIMEOUT_MS = 120_000;

type PendingRunTimeoutArgs = {
  pendingStartedAt: number | null;
  runStatusUpdatedAt?: number | null;
  lastStageAt?: number | null;
  lastAssistantMessageAt?: number | null;
  workerLastHeartbeatAt?: number | null;
  now?: number;
  inactivityTimeoutMs?: number;
  maxTimeoutMs?: number;
};

function pickProgressTimestamp(
  pendingStartedAt: number,
  value: number | null | undefined,
) {
  return typeof value === "number" && value >= pendingStartedAt ? value : null;
}

export function getLatestPendingRunProgressAt(args: PendingRunTimeoutArgs) {
  if (!args.pendingStartedAt) {
    return null;
  }

  const candidates = [
    args.pendingStartedAt,
    pickProgressTimestamp(args.pendingStartedAt, args.runStatusUpdatedAt),
    pickProgressTimestamp(args.pendingStartedAt, args.lastStageAt),
    pickProgressTimestamp(args.pendingStartedAt, args.lastAssistantMessageAt),
    pickProgressTimestamp(args.pendingStartedAt, args.workerLastHeartbeatAt),
  ].filter((value): value is number => typeof value === "number");

  return candidates.length > 0 ? Math.max(...candidates) : args.pendingStartedAt;
}

export function getPendingRunTimeoutSnapshot(args: PendingRunTimeoutArgs) {
  if (!args.pendingStartedAt) {
    return {
      hasTimedOut: false,
      lastProgressAt: null,
      msUntilTimeout: null,
      timeoutAt: null,
      timedOutBy: null as "inactivity" | "max" | null,
    };
  }

  const now = args.now ?? Date.now();
  const inactivityTimeoutMs = args.inactivityTimeoutMs ?? ASSISTANT_PENDING_TIMEOUT_MS;
  const maxTimeoutMs = args.maxTimeoutMs ?? ASSISTANT_PENDING_MAX_TIMEOUT_MS;
  const lastProgressAt = getLatestPendingRunProgressAt(args) ?? args.pendingStartedAt;
  const inactivityDeadline = lastProgressAt + inactivityTimeoutMs;
  const maxDeadline = args.pendingStartedAt + maxTimeoutMs;
  const timeoutAt = Math.min(inactivityDeadline, maxDeadline);
  const hasTimedOut = now >= timeoutAt;
  const timedOutBy = hasTimedOut
    ? maxDeadline <= inactivityDeadline
      ? "max"
      : "inactivity"
    : null;

  return {
    hasTimedOut,
    lastProgressAt,
    msUntilTimeout: hasTimedOut ? 0 : Math.max(0, timeoutAt - now),
    timeoutAt,
    timedOutBy,
  };
}
