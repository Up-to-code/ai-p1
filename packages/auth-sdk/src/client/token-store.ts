export type MemoryTokenSet = {
  accessToken: string;
  tokenType: "Bearer" | string;
  expiresAtMs?: number | null;
  scopes: string[];
};

export type MemoryTokenStore = {
  get(): MemoryTokenSet | null;
  set(tokenSet: MemoryTokenSet | null): void;
  clear(): void;
  subscribe(listener: (tokenSet: MemoryTokenSet | null) => void): () => void;
};

export function createMemoryTokenStore(initialTokenSet: MemoryTokenSet | null = null): MemoryTokenStore {
  let current = initialTokenSet;
  const listeners = new Set<(tokenSet: MemoryTokenSet | null) => void>();

  function emit() {
    for (const listener of listeners) {
      listener(current);
    }
  }

  return {
    get: () => current,
    set(tokenSet) {
      current = tokenSet;
      emit();
    },
    clear() {
      current = null;
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
