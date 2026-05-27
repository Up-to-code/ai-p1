import type { AssistantSurfaceCopy } from "@/conversation/assistantProtocol";
import type { AgentChatEvent } from "@/persistence/api/conversationApi";

type AgentDebugPayload = Record<string, unknown>;

const maxPreviewLength = 160;

function devModeEnabled() {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

export function isAgentDebugEnabled() {
  return devModeEnabled() || process.env.EXPO_PUBLIC_AGENT_DEBUG === "1";
}

function previewText(value: unknown) {
  if (typeof value !== "string") return value;
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxPreviewLength ? `${compact.slice(0, maxPreviewLength)}...` : compact;
}

function sanitizePayload(payload: AgentDebugPayload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (/prompt|message|text|body/i.test(key)) {
        return [key, previewText(value)];
      }
      return [key, value];
    }),
  );
}

export function logAgentDebug(
  event: string,
  payload: AgentDebugPayload = {},
  level: "debug" | "warn" | "error" = "debug",
) {
  if (!isAgentDebugEnabled()) return;

  const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.debug;
  logger(`[mobile.agent] ${event}`, sanitizePayload(payload));
}

export function logAgentSseEvent(event: AgentChatEvent, payload: AgentDebugPayload = {}) {
  const basePayload = {
    ...payload,
    eventType: event.type,
  };

  if (event.type === "text") {
    logAgentDebug("sse.text", {
      ...basePayload,
      length: event.text.length,
      text: event.text,
    });
    return;
  }

  if (event.type === "status") {
    logAgentDebug("sse.status", {
      ...basePayload,
      message: event.message,
    });
    return;
  }

  if (event.type === "error") {
    logAgentDebug("sse.error", {
      ...basePayload,
      error: event.error,
    }, "error");
    return;
  }

  logAgentDebug(`sse.${event.type}`, basePayload);
}

export function extractProviderRequestId(message: string) {
  return message.match(/Request ID:\s*([A-Za-z0-9_-]+)/i)?.[1] ?? null;
}

export function normalizeAgentFailureMessage(message: string, copy: AssistantSurfaceCopy) {
  const requestId = extractProviderRequestId(message);

  if (/^Agent request failed\.?$/i.test(message)) {
    return copy.aiUnavailableBody;
  }

  if (/server error/i.test(message) && requestId) {
    return `${copy.aiUnavailableBody} Request ID: ${requestId}`;
  }

  return message;
}
