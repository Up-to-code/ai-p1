"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getItem, setItem, removeItem } from "./adapters/indexeddb-adapter";

interface UseIndexedDbConfigResult<T> {
  value: T;
  setValue: (next: T) => Promise<void>;
  reset: () => Promise<void>;
  isLoaded: boolean;
}

export function useIndexedDbConfig<T>(
  store: "layouts" | "cache" | "drafts",
  key: string,
  defaults: T,
): UseIndexedDbConfigResult<T> {
  const [value, setValueState] = useState<T>(defaults);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getItem(store, key).then((entry) => {
      if (entry) {
        setValueState(entry.value as T);
      }
      setIsLoaded(true);
    });
  }, [store, key]);

  const setValue = useCallback(
    async (next: T) => {
      setValueState(next);
      await setItem(store, key, next as Record<string, unknown>);
    },
    [store, key],
  );

  const reset = useCallback(async () => {
    setValueState(defaults);
    await removeItem(store, key);
  }, [store, key, defaults]);

  return { value, setValue, reset, isLoaded };
}
