"use client";

import { useState, useEffect, useCallback } from "react";

export function useConvexConfig<T>(config: {
  remote: T | undefined;
  save: (value: T) => Promise<void>;
  defaults: T;
}): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(
    config.remote !== undefined ? config.remote : config.defaults,
  );

  useEffect(() => {
    if (config.remote !== undefined) {
      setValue(config.remote);
    }
  }, [config.remote]);

  const persist = useCallback(
    async (next: T) => {
      setValue(next);
      try {
        await config.save(next);
      } catch {
        /* ignore */
      }
    },
    [config.save],
  );

  return [value, persist];
}
