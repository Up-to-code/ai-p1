export const DEFAULT_CLOCK_TOLERANCE_SECONDS = 60;

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function secondsToMilliseconds(seconds: number): number {
  return Math.max(0, seconds * 1000);
}

export function getRefreshDelayMs(params: {
  expiresAtMs?: number | null;
  nowMs?: number;
  skewMs?: number;
  jitterMs?: number;
  minimumDelayMs?: number;
}): number | null {
  if (!params.expiresAtMs) return null;
  const nowMs = params.nowMs ?? Date.now();
  const skewMs = params.skewMs ?? 60_000;
  const jitterMs = params.jitterMs ?? Math.floor(Math.random() * 10_000);
  const minimumDelayMs = params.minimumDelayMs ?? 1_000;
  return Math.max(minimumDelayMs, params.expiresAtMs - nowMs - skewMs - jitterMs);
}
