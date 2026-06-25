"use client";

import { useEffect } from "react";
import { isTypingTarget } from "../lib/search-utils";

/** Registers Cmd/Ctrl+K and `/` shortcuts for opening global search. */
export function useGlobalSearchShortcuts(open: boolean, onToggle: () => void, onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onToggle();
        return;
      }

      if (event.key === "/" && !open && !isTypingTarget(event.target)) {
        event.preventDefault();
        onOpen();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen, onToggle, open]);
}

export function useGlobalSearchFocus(open: boolean, inputRef: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timeout);
  }, [inputRef, open]);
}
