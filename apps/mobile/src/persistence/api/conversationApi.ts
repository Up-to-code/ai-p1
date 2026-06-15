import {
  buildWorkspaceApiRequest,
  isNativeWorkspaceRuntime,
  workspaceApiFetch,
} from "@/persistence/api/workspaceApiClient";
import type { UploadedAgentAttachment } from "@/types/domain";

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

export type AgentThreadPage = {
  threads: AgentThread[];
  isDone: boolean;
  continueCursor: string | null;
};

export type AgentMessage = {
  _id: string;
  id?: string;
  _creationTime: number;
  organizationId?: string;
  threadId?: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  attachments?: UploadedAgentAttachment[];
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
  const page = await listAgentThreadsPage(organizationId, { limit });
  return page.threads;
}

export async function listAgentThreadsPage(
  organizationId: string,
  input: { limit?: number; cursor?: string | null } = {},
): Promise<AgentThreadPage> {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(input.limit ?? 10));
  if (input.cursor) searchParams.set("cursor", input.cursor);

  const response = await workspaceApiFetch(
    `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/threads?${searchParams.toString()}`,
  );
  const payload = await readJson<{
    threads?: AgentThread[];
    isDone?: boolean;
    continueCursor?: string | null;
  }>(response, "Unable to load conversations.");
  return {
    threads: Array.isArray(payload.threads) ? payload.threads : [],
    isDone: payload.isDone ?? true,
    continueCursor: payload.continueCursor ?? null,
  };
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

function buildAgentChatPath(organizationId: string) {
  return `/api/v1/organizations/${encodeURIComponent(organizationId)}/agents/chat`;
}

function buildAgentChatPayload(input: {
  threadId?: string | null;
  message: string;
  attachments?: UploadedAgentAttachment[];
}) {
  return {
    message: input.message,
    threadId: input.threadId ?? undefined,
    attachments: input.attachments?.length ? input.attachments : undefined,
  };
}

function parseJsonError(value: string, fallbackMessage: string) {
  try {
    const payload = JSON.parse(value) as { error?: unknown };
    return typeof payload.error === "string" && payload.error.trim() ? payload.error : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function sendAgentChatRequestWithXhr(input: {
  organizationId: string;
  threadId?: string | null;
  message: string;
  attachments?: UploadedAgentAttachment[];
  signal?: AbortSignal;
  onEvent: (event: AgentChatEvent) => void;
}) {
  const request = await buildWorkspaceApiRequest(buildAgentChatPath(input.organizationId), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildAgentChatPayload(input)),
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let responseIndex = 0;
    let eventBuffer = "";
    let settled = false;

    const cleanup = () => {
      input.signal?.removeEventListener("abort", handleAbort);
    };

    const settle = (callback: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback();
    };

    const parseAvailableText = () => {
      const nextText = xhr.responseText.slice(responseIndex);
      if (!nextText) return;
      responseIndex = xhr.responseText.length;
      eventBuffer = parseAgentSseChunk(eventBuffer + nextText, input.onEvent);
    };

    const handleAbort = () => {
      xhr.abort();
      settle(() => reject(new Error("Agent request was canceled.")));
    };

    xhr.onprogress = parseAvailableText;
    xhr.onerror = () => {
      settle(() => reject(new Error("Agent request failed.")));
    };
    xhr.onloadend = () => {
      parseAvailableText();

      if (xhr.status < 200 || xhr.status >= 300) {
        const message = parseJsonError(xhr.responseText, "Agent request failed.");
        settle(() => reject(new Error(message)));
        return;
      }

      if (eventBuffer.trim()) {
        eventBuffer = parseAgentSseChunk(`${eventBuffer}\n\n`, input.onEvent);
      }
      settle(resolve);
    };

    if (input.signal?.aborted) {
      handleAbort();
      return;
    }

    input.signal?.addEventListener("abort", handleAbort, { once: true });

    xhr.open(request.init.method ?? "GET", request.url, true);
    xhr.withCredentials = true;
    const headers = request.init.headers instanceof Headers
      ? request.init.headers
      : new Headers(request.init.headers);
    headers.forEach((value, key) => {
      xhr.setRequestHeader(key, value);
    });
    xhr.send(request.init.body as XMLHttpRequestBodyInit);
  });
}

export async function sendAgentChatRequest(input: {
  organizationId: string;
  threadId?: string | null;
  message: string;
  attachments?: UploadedAgentAttachment[];
  signal?: AbortSignal;
  onEvent: (event: AgentChatEvent) => void;
}) {
  if (isNativeWorkspaceRuntime() && typeof XMLHttpRequest !== "undefined") {
    await sendAgentChatRequestWithXhr(input);
    return;
  }

  const response = await workspaceApiFetch(
    buildAgentChatPath(input.organizationId),
    {
      method: "POST",
      signal: input.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildAgentChatPayload(input)),
    },
  );

  if (!response.ok) {
    await readJson(response, "Agent request failed.");
    throw new Error("Agent request failed.");
  }

  if (!response.body) {
    const bufferedStream = await response.text();
    if (bufferedStream.trim()) {
      parseAgentSseChunk(`${bufferedStream}\n\n`, input.onEvent);
    }
    return;
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

export type OrganizationProfile = {
  organizationId: string;
  name: string;
  legalName: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo?: string;
  updatedAt: number;
};

export async function fetchOrganizationProfile(organizationId: string): Promise<OrganizationProfile | null> {
  try {
    const response = await workspaceApiFetch(
      `/api/v1/organizations/${encodeURIComponent(organizationId)}/profile`,
    );
    const payload = await readJson<{ profile?: OrganizationProfile }>(response, "Unable to load organization profile.");
    return payload.profile ?? null;
  } catch {
    return null;
  }
}
