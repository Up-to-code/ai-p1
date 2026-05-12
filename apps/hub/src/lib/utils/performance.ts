"use client";

type PerformanceDetail = Record<string, unknown>;

function isPerformanceDebugEnabled() {
  return (
    typeof window !== "undefined" &&
    (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ANAN_PERF_DEBUG === "1")
  );
}

export function markAppPerformance(name: string, detail?: PerformanceDetail) {
  if (!isPerformanceDebugEnabled()) return;
  const markName = `anan:${name}`;
  try {
    performance.mark(markName, detail ? { detail } : undefined);
  } catch {
    performance.mark(markName);
  }
  if (process.env.NEXT_PUBLIC_ANAN_PERF_DEBUG === "1") {
    console.debug("[anan:perf]", name, detail ?? "");
  }
}

export function measureAppPerformance(name: string, startMark: string, endMark?: string) {
  if (!isPerformanceDebugEnabled()) return;
  try {
    performance.measure(`anan:${name}`, `anan:${startMark}`, endMark ? `anan:${endMark}` : undefined);
  } catch {
    // Marks are best-effort diagnostics and should never affect app behavior.
  }
}
