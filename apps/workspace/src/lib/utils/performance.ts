"use client";

type PerformanceDetail = Record<string, unknown>;

function isPerformanceDebugEnabled() {
  return (
    typeof window !== "undefined" &&
    (process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_QENTRAH_PERF_DEBUG === "1")
  );
}

export function markAppPerformance(name: string, detail?: PerformanceDetail) {
  if (!isPerformanceDebugEnabled()) return;
  const markName = `qentrah:${name}`;
  try {
    performance.mark(markName, detail ? { detail } : undefined);
  } catch {
    performance.mark(markName);
  }
  if (process.env.NEXT_PUBLIC_QENTRAH_PERF_DEBUG === "1") {
    console.debug("[qentrah:perf]", name, detail ?? "");
  }
}

export function measureAppPerformance(name: string, startMark: string, endMark?: string) {
  if (!isPerformanceDebugEnabled()) return;
  try {
    performance.measure(`qentrah:${name}`, `qentrah:${startMark}`, endMark ? `qentrah:${endMark}` : undefined);
  } catch {
    // Marks are best-effort diagnostics and should never affect app behavior.
  }
}
