export type TokenSet = {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  refreshToken?: string;
  idToken?: string;
  scope?: string;
};

export type TokenStorage = {
  get(): TokenSet | null;
  set(tokens: TokenSet): void;
  clear(): void;
};

export function createMemoryTokenStorage(initial?: TokenSet | null): TokenStorage {
  let current = initial ?? null;
  return {
    get: () => current,
    set(tokens) {
      current = tokens;
    },
    clear() {
      current = null;
    },
  };
}

export function createBrowserTokenStorage(key: string, storage: Storage = window.localStorage): TokenStorage {
  return {
    get() {
      const raw = storage.getItem(key);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as TokenSet;
      } catch {
        return null;
      }
    },
    set(tokens) {
      storage.setItem(key, JSON.stringify(tokens));
    },
    clear() {
      storage.removeItem(key);
    },
  };
}
