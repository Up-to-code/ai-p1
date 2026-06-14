"use client";

import type { AgentChatAttachment, AgentChatEvent } from "./chat";

type SendAgentChatRequestInput = {
  organizationId: string;
  threadId?: string;
  projectId?: string;
  message: string;
  attachments?: AgentChatAttachment[];
  onEvent: (event: AgentChatEvent) => void;
};

function agentChatPath(organizationId: string) {
  return `/api/v1/organizations/${organizationId}/agents/chat`;
}

function agentThreadPath(organizationId: string, threadId: string) {
  return `/api/v1/organizations/${organizationId}/agents/threads/${threadId}`;
}

export function parseAgentSseChunk(buffer: string, onEvent: (event: AgentChatEvent) => void) {
  const events = buffer.split("\n\n");
  const rest = events.pop() ?? "";

  for (const rawEvent of events) {
    const dataLine = rawEvent
      .split("\n")
      .find((line) => line.startsWith("data: "));
    if (!dataLine) continue;

    try {
      onEvent(JSON.parse(dataLine.slice(6)) as AgentChatEvent);
    } catch {
      onEvent({ type: "error", error: "Agent stream returned an invalid event." });
    }
  }

  return rest;
}

export async function sendAgentChatRequest(input: SendAgentChatRequestInput) {
  const response = await fetch(agentChatPath(input.organizationId), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: input.message,
      threadId: input.threadId,
      projectId: input.projectId,
      attachments: input.attachments?.length ? input.attachments : undefined,
    }),
  });

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Agent request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer = parseAgentSseChunk(buffer + decoder.decode(value, { stream: true }), input.onEvent);
  }

  if (buffer.trim()) {
    parseAgentSseChunk(`${buffer}\n\n`, input.onEvent);
  }
}

export async function deleteAgentThreadRequest(organizationId: string, threadId: string) {
  const response = await fetch(agentThreadPath(organizationId, threadId), {
    method: "DELETE",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Unable to delete conversation.");
  }

  return response.json() as Promise<{ deleted: true; threadId: string }>;
}
