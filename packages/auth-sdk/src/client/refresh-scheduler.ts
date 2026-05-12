import { getRefreshDelayMs } from "../internal/time";

export type RefreshScheduler = {
  schedule(expiresAtMs?: number | null): void;
  stop(): void;
};

export function createRefreshScheduler(options: {
  refresh: () => Promise<unknown>;
  onError?: (error: unknown) => void;
  skewMs?: number;
  minimumDelayMs?: number;
}): RefreshScheduler {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  async function run() {
    if (stopped) return;
    try {
      await options.refresh();
    } catch (error) {
      options.onError?.(error);
    }
  }

  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  return {
    schedule(expiresAtMs) {
      clear();
      const delay = getRefreshDelayMs({
        expiresAtMs,
        skewMs: options.skewMs,
        minimumDelayMs: options.minimumDelayMs,
      });
      if (delay === null) return;
      timer = setTimeout(run, delay);
    },
    stop() {
      stopped = true;
      clear();
    },
  };
}
