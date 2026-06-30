"use client";

import { useState, useCallback, useRef } from "react";

export function useFallbackConfig<T>(config: {
  key: string;
  remote: T | undefined;
  save: (value: T) => Promise<void>;
  defaults: T;
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (config.remote !== undefined) return config.remote;
    if (typeof window === "undefined") return config.defaults;
    try {
      const saved = localStorage.getItem(config.key);
      if (saved) return JSON.parse(saved) as T;
    } catch {
      /* ignore */
    }
    return config.defaults;
  });

  const latestValue = useRef(value);
  latestValue.current = value;

  const persist = useCallback(
    async (next: T | ((prev: T) => T)) => {
      let resolved: T;
      if (typeof next === "function") {
        setValue(next as (prev: T) => T);
        resolved = (next as (prev: T) => T)(latestValue.current);
      } else {
        setValue(next);
        resolved = next;
      }
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(config.key, JSON.stringify(resolved));
        } catch {
          /* ignore */
        }
      }
      try {
        await config.save(resolved);
      } catch {
        /* ignore */
      }
    },
    [config.key, config.save],
  );

  return [value, persist];
}
