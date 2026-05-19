import type { ConvexReactClient } from "convex/react";

import { api } from "@/persistence/convex/api";
import type { AnalyticsEventName } from "@/types/domain";

let analyticsClient: ConvexReactClient | null = null;

export function registerAnalyticsClient(client: ConvexReactClient | null) {
  analyticsClient = client;
}

export function track(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}) {
  if (analyticsClient) {
    void analyticsClient.mutation(api.analytics.public.trackEvent.trackEvent, {
      eventName,
      sessionId: typeof payload.sessionId === "string" ? payload.sessionId : undefined,
      threadId: typeof payload.threadId === "string" ? payload.threadId : undefined,
      route: typeof payload.route === "string" ? payload.route : undefined,
      source: typeof payload.source === "string" ? payload.source : undefined,
      payload: JSON.stringify(payload),
    });
  }
}
