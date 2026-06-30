"use client";

import { useState, useCallback } from "react";

export function useLocalConfig<T>(key: string, defaults: T): [T, (next: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved) as T;
    } catch {
      /* ignore */
    }
    return defaults;
  });

  const persist = useCallback(
    (next: T) => {
      setValue(next);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    },
    [key],
  );

  const reset = useCallback(() => {
    setValue(defaults);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }, [key, defaults]);

  return [value, persist, reset];
}
