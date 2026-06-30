"use client";

import { useState, useCallback, useRef } from "react";

export function useConvexConfig<T>(config: {
  remote: T | undefined;
  save: (value: T) => Promise<void>;
  defaults: T;
}): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(
    config.remote !== undefined ? config.remote : config.defaults,
  );
  const prevRemoteRef = useRef<T | undefined>(config.remote);

  if (config.remote !== prevRemoteRef.current) {
    prevRemoteRef.current = config.remote;
    if (config.remote !== undefined) {
      setValue(config.remote);
    }
  }

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
