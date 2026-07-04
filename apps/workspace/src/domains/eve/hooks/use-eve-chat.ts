"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEveAgent, defaultMessageReducer } from "eve/react";
import type { SessionState } from "eve/client";
import type { EveMessageData, EveMessage } from "eve/client";

type UseEveChatOptions = {
  organizationId?: string;
};

export type FlattenedMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function flattenEveMessages(messages: readonly EveMessage[]): FlattenedMessage[] {
  return messages.map((msg) => {
    const text = msg.parts
      .filter((p): p is typeof p & { text: string } => "text" in p)
      .map((p) => p.text)
      .join("");
    return { id: msg.id, role: msg.role, content: text };
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

export function useEveChat(_options: UseEveChatOptions = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const stateParam = searchParams.get("state");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const initialSession = useMemo(() => {
    if (!stateParam) return undefined;
    return decodeSession(stateParam);
  }, [stateParam]);

  const handle = useEveAgent({
    reducer: defaultMessageReducer(),
    initialSession,
    onSessionChange: (sess) => {
      const params = new URLSearchParams(window.location.search);
      params.set("state", encodeSession(sess));
      window.history.replaceState(null, "", `${pathname}?${params}`);
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

  return {
    messages,
    isSending,
    isStreaming,
    errorMessage,
    status: handle.status,
    send: handleSend,
    stop: handleStop,
    reset: handleNewThread,
  };
}
