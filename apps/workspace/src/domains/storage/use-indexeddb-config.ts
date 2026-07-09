"use client";

import { useState, useEffect, useCallback } from "react";
import { getItem, setItem, removeItem } from "./adapters/indexeddb-adapter";

interface UseIndexedDbConfigResult<T> {
  value: T;
  setValue: (next: T) => Promise<void>;
  reset: () => Promise<void>;
  isLoaded: boolean;
}

export interface UseIndexedDbConfigOptions {
  onError?: (error: unknown, operation: "read" | "write" | "reset") => void;
}

export function useIndexedDbConfig<T>(
  store: "layouts" | "cache" | "drafts",
  key: string,
  defaults: T,
  options?: UseIndexedDbConfigOptions,
): UseIndexedDbConfigResult<T> {
  const onError = options?.onError;
  const [value, setValueState] = useState<T>(defaults);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setValueState(defaults);
    setIsLoaded(false);
    getItem(store, key)
      .then((entry) => {
        if (cancelled) return;
        if (entry) setValueState(entry.value as T);
        setIsLoaded(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        onError?.(error, "read");
        setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [defaults, key, onError, store]);

  const setValue = useCallback(
    async (next: T) => {
      setValueState(next);
      try {
        await setItem(store, key, next as Record<string, unknown>);
      } catch (error: unknown) {
        onError?.(error, "write");
      }
    },
    [key, onError, store],
  );

  const reset = useCallback(async () => {
    setValueState(defaults);
    try {
      await removeItem(store, key);
    } catch (error: unknown) {
      onError?.(error, "reset");
    }
  }, [defaults, key, onError, store]);

  return { value, setValue, reset, isLoaded };
}
