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
    onSessionChange: (sess) => {
      // Only save to URL when not using a restored thread (parent manages URL)
      if (!propInitialSession) {
        const params = new URLSearchParams(window.location.search);
        params.set("state", encodeSession(sess));
        window.history.replaceState(null, "", `${pathname}?${params}`);
      }
    },
    onError: (err) => {
      setErrorMessage(err.message);
    },
  });

  const messages = useMemo(() => flattenEveMessages(handle.data.messages), [handle.data.messages]);
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
    const params = new URLSearchParams(window.location.search);
    params.delete("state");
    window.history.replaceState(null, "", `${pathname}?${params}`);
  }, [handle.reset, pathname]);

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
    send: handleSend,
    stop: handleStop,
    reset: handleNewThread,
    session,
    events,
  };
}
