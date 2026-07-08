"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEveAgent, defaultMessageReducer } from "eve/react";
import type { SessionState, HandleMessageStreamEvent } from "eve/client";
import type { EveMessageData, EveMessage } from "eve/client";

type UseEveChatOptions = {
  organizationId?: string;
  initialSession?: SessionState;
  initialEvents?: readonly HandleMessageStreamEvent[];
  restoreAttempted?: boolean;
};

export type FlattenedMessage = {
  id: string;
  role: "user" | "assistant";
  /** The answer text — only `type: "text"` parts, never reasoning. */
  content: string;
  /** Native model reasoning — only `type: "reasoning"` parts, never leaked into content. */
  reasoning: string;
};

export type EveActionProgressItem = {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "running" | "completed" | "failed" | "rejected";
};

export type EveActionProgress = {
  turnId?: string;
  status: "idle" | "running" | "completed" | "failed" | "waiting";
  items: EveActionProgressItem[];
};

function flattenEveMessages(messages: readonly EveMessage[]): FlattenedMessage[] {
  return messages.map((msg) => {
    // Separate text parts from reasoning parts using Eve's native part.type discriminant.
    // Never merge them — reasoning must never appear in the rendered answer.
    const content = msg.parts
      .filter((p): p is typeof p & { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");

    const reasoning = msg.parts
      .filter((p): p is typeof p & { type: "reasoning"; text: string } => p.type === "reasoning")
      .map((p) => p.text)
      .join("");

    return { id: msg.id, role: msg.role, content, reasoning };
  });
}

function encodeSession(state: SessionState): string {
  return btoa(JSON.stringify(state));
}

function decodeSession(raw: string): SessionState | undefined {
  try {
    return JSON.parse(atob(raw)) as SessionState;
  } catch {
    return undefined;
  }
}

function isRecoverableEveSessionError(message: string) {
  return (
    message.includes("socket hang up") ||
    message.includes("ECONNRESET") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Session not found") ||
    message.includes("Failed to fetch")
  );
}

function formatActionName(name: string) {
  return name
    .replace(/[_:]+/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarizeActionInput(input: unknown) {
  if (!input || typeof input !== "object") return undefined;
  const record = input as Record<string, unknown>;
  const candidate =
    record.title ??
    record.name ??
    record.query ??
    record.message ??
    record.description;
  if (typeof candidate !== "string") return undefined;
  const compact = candidate.replace(/\s+/g, " ").trim();
  if (!compact) return undefined;
  return compact.length > 80 ? `${compact.slice(0, 77)}...` : compact;
}

function deriveActionProgress(events: readonly HandleMessageStreamEvent[]): EveActionProgress {
  const latestTurnId = [...events]
    .reverse()
    .find((event) => event.type === "turn.started")?.data.turnId;

  if (!latestTurnId) {
    return { status: "idle", items: [] };
  }

  const items = new Map<string, EveActionProgressItem>();
  let turnStatus: EveActionProgress["status"] = "running";

  for (const event of events) {
    if ("data" in event) {
      const data = event.data as { turnId?: string };
      if (data.turnId && data.turnId !== latestTurnId) continue;
    }

    if (event.type === "actions.requested") {
      for (const action of event.data.actions) {
        if (action.kind === "load-skill") continue;
        const name =
          action.kind === "tool-call"
            ? action.toolName
            : action.kind === "subagent-call"
              ? action.subagentName
              : action.remoteAgentName;
        items.set(action.callId, {
          id: action.callId,
          label: formatActionName(name),
          detail: summarizeActionInput(action.input),
          status: "pending",
        });
      }
      continue;
    }

    if (event.type === "subagent.called") {
      const existing = items.get(event.data.callId);
      items.set(event.data.callId, {
        id: event.data.callId,
        label: existing?.label ?? formatActionName(event.data.name),
        detail: existing?.detail,
        status: "running",
      });
      continue;
    }

    if (event.type === "subagent.completed") {
      const existing = items.get(event.data.callId);
      if (existing) {
        items.set(event.data.callId, {
          ...existing,
          status: "completed",
        });
      }
      continue;
    }

    if (event.type === "action.result") {
      const result = event.data.result;
      const name =
        result.kind === "tool-result"
          ? result.toolName
          : result.kind === "subagent-result"
            ? result.subagentName
            : result.name ?? "Skill";
      items.set(result.callId, {
        id: result.callId,
        label: items.get(result.callId)?.label ?? formatActionName(name),
        detail: items.get(result.callId)?.detail,
        status: event.data.status,
      });
      continue;
    }

    if (event.type === "input.requested") {
      turnStatus = "waiting";
      continue;
    }

    if (event.type === "turn.failed" || event.type === "step.failed" || event.type === "session.failed") {
      turnStatus = "failed";
      continue;
    }

    if (event.type === "turn.completed" || event.type === "session.waiting") {
      turnStatus = turnStatus === "failed" ? "failed" : "completed";
    }
  }

  const progressItems = Array.from(items.values());
  if (progressItems.length === 0) {
    return { turnId: latestTurnId, status: "idle", items: [] };
  }
  if (progressItems.some((item) => item.status === "failed")) {
    return { turnId: latestTurnId, status: "failed", items: progressItems };
  }
  if (turnStatus === "completed" && progressItems.every((item) => item.status === "completed" || item.status === "rejected")) {
    return { turnId: latestTurnId, status: "completed", items: progressItems };
  }
  return { turnId: latestTurnId, status: turnStatus, items: progressItems };
}

export function useEveChat({
  organizationId,
  initialSession: propInitialSession,
  initialEvents: propInitialEvents,
  restoreAttempted,
}: UseEveChatOptions = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const stateParam = searchParams.get("state");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const recoveredStaleSessionRef = useRef(false);

  const clearSessionUrlParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("state");
    params.delete("threadId");
    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [pathname]);

  // Use prop-based initialSession if provided, otherwise fall back to URL ?state=
  // When restoreAttempted is true (thread was not found), don't fall back to URL
  const initialSession = useMemo(() => {
    if (propInitialSession) return propInitialSession;
    if (restoreAttempted) return undefined;
    if (!stateParam) return undefined;
    return decodeSession(stateParam);
  }, [propInitialSession, restoreAttempted, stateParam]);

  const handle = useEveAgent({
    reducer: defaultMessageReducer(),
    initialSession,
    initialEvents: propInitialEvents,
    headers: organizationId ? { "X-Organization-Id": organizationId } : undefined,
    maxReconnectAttempts: 1,
    onSessionChange: (sess) => {
      // Only save to URL when not using a restored thread (parent manages URL)
      if (!propInitialSession) {
        const params = new URLSearchParams(window.location.search);
        params.set("state", encodeSession(sess));
        window.history.replaceState(null, "", `${pathname}?${params}`);
      }
    },
    onError: (err) => {
      if (
        !recoveredStaleSessionRef.current &&
        (stateParam || propInitialSession) &&
        isRecoverableEveSessionError(err.message)
      ) {
        recoveredStaleSessionRef.current = true;
        handle.reset();
        clearSessionUrlParams();
        setErrorMessage("The previous AI session expired. Start a new message to continue.");
        return;
      }
      setErrorMessage(err.message);
    },
  });

  const messages = useMemo(() => flattenEveMessages(handle.data.messages), [handle.data.messages]);
  const progress = useMemo(() => deriveActionProgress(handle.events), [handle.events]);
  const isStreaming = handle.status === "submitted" || handle.status === "streaming";

  const handleSend = useCallback(
    async (text: string, _files?: File[]) => {
      if (!text.trim()) return;
      setIsSending(true);
      setErrorMessage(undefined);
      try {
        await handle.send({ message: text });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Agent request failed.";
        if (message.includes("Unexpected token") || message.includes("is not valid JSON")) {
          setErrorMessage("Server returned an unexpected response. Try reloading the page.");
        } else {
          setErrorMessage(message);
        }
      } finally {
        setIsSending(false);
      }
    },
    [handle.send],
  );

  const handleNewThread = useCallback(() => {
    handle.reset();
    clearSessionUrlParams();
  }, [clearSessionUrlParams, handle.reset]);

  const handleStop = useCallback(() => {
    handle.stop();
  }, [handle.stop]);

  // Expose session and events for thread persistence
  const session = handle.session;
  const events = handle.events;

  return {
    messages,
    isSending,
    isStreaming,
    errorMessage,
    status: handle.status,
    progress,
    send: handleSend,
    stop: handleStop,
    reset: handleNewThread,
    session,
    events,
  };
}
