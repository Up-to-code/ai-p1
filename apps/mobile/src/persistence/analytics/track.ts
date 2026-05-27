import type { AnalyticsEventName } from "@/types/domain";

export function track(_eventName: AnalyticsEventName, _payload: Record<string, unknown> = {}) {
  // Workspace analytics is intentionally server-owned; mobile keeps this as a local no-op for now.
}
