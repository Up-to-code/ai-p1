import { workspaceApiFetch } from "@/persistence/api/workspaceApiClient";

export type AgentChatEvent =
  | { type: "meta"; threadId: string; runId: string }
  | { type: "status"; message: string }
  | { type: "text"; text: string }
  | { type: "ag_ui"; turn: unknown }
  | {
      type: "confirmation_required";
      confirmationId: string;
      summary: string;
      resource: string;
      action: string;
      inputPreview?: string;
      expiresAt: number;
    }
  | { type: "done"; threadId: string }
  | { type: "error"; error: string };

export type AgentThread = {
  _id: string;
  id?: string;
  _creationTime: number;
  organizationId?: string;
  title?: string | null;
  summary?: string | null;
  createdAt?: number;
  updatedAt?: number;
  lastMessageAt?: number;
};

export type AgentMessage = {
  _id: string;
  id?: string;
  _creationTime: number;
  organizationId?: string;
  threadId?: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  runId?: string;
  createdAt?: number;
  agUiTurn?: unknown;
};

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload && typeof payload === "object" && "error" in payload
      ? String((payload as { error: unknown }).error)
      : fallbackMessage;
    throw new Error(error);
  }

  return payload as T;
}

export async function listAgentThreads(organizationId: string, limit = 50) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/threads?limit=${limit}`,
  );
  const payload = await readJson<{ threads?: AgentThread[] }>(response, "Unable to load conversations.");
  return Array.isArray(payload.threads) ? payload.threads : [];
}

export async function listAgentMessages(organizationId: string, threadId: string, limit = 80) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/threads/${encodeURIComponent(threadId)}/messages?limit=${limit}`,
  );
  const payload = await readJson<{ messages?: AgentMessage[] }>(response, "Unable to load messages.");
  return Array.isArray(payload.messages) ? payload.messages : [];
}

export function parseAgentSseChunk(buffer: string, onEvent: (event: AgentChatEvent) => void) {
  const events = buffer.split("\n\n");
  const rest = events.pop() ?? "";

  for (const rawEvent of events) {
    const dataLines = rawEvent
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .map((line) => line.slice(6));
    if (dataLines.length === 0) continue;

    try {
      onEvent(JSON.parse(dataLines.join("\n")) as AgentChatEvent);
    } catch {
      onEvent({ type: "error", error: "Agent stream returned an invalid event." });
    }
  }

  return rest;
}

export async function sendAgentChatRequest(input: {
  organizationId: string;
  threadId?: string | null;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: AgentChatEvent) => void;
}) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(input.organizationId)}/agents/chat`,
    {
      method: "POST",
      signal: input.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: input.message,
        threadId: input.threadId ?? undefined,
      }),
    },
  );

  if (!response.ok || !response.body) {
    await readJson(response, "Agent request failed.");
    throw new Error("Agent request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer = parseAgentSseChunk(buffer + decoder.decode(value, { stream: true }), input.onEvent);
  }

  const finalChunk = decoder.decode();
  if (finalChunk) {
    buffer = parseAgentSseChunk(buffer + finalChunk, input.onEvent);
  }

  if (buffer.trim()) {
    parseAgentSseChunk(`${buffer}\n\n`, input.onEvent);
  }
}

export async function approveAgentConfirmation(organizationId: string, confirmationId: string) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/confirmations/${encodeURIComponent(confirmationId)}/approve`,
    { method: "POST" },
  );
  return readJson(response, "Unable to approve this action.");
}

export async function cancelAgentConfirmation(organizationId: string, confirmationId: string) {
  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/confirmations/${encodeURIComponent(confirmationId)}/cancel`,
    { method: "POST" },
  );
  return readJson(response, "Unable to cancel this action.");
}
