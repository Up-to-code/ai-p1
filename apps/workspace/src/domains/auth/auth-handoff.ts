export const AUTH_HANDOFF_STORAGE_KEY = "qentrah-auth-handoff";
export const AUTH_HANDOFF_TTL_MS = 12_000;

type AuthHandoff = {
  organizationId: string;
  createdAt: number;
};

export function createAuthHandoff(organizationId: string, now = Date.now()): AuthHandoff {
  return { organizationId, createdAt: now };
}

export function encodeAuthHandoff(handoff: AuthHandoff) {
  return JSON.stringify(handoff);
}

export function decodeAuthHandoff(value: string | null, now = Date.now()) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AuthHandoff>;
    if (!parsed.organizationId || typeof parsed.organizationId !== "string") return null;
    if (typeof parsed.createdAt !== "number") return null;
    if (now - parsed.createdAt > AUTH_HANDOFF_TTL_MS) return null;
    return {
      organizationId: parsed.organizationId,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export function writeAuthHandoff(organizationId: string) {
  window.sessionStorage.setItem(
    AUTH_HANDOFF_STORAGE_KEY,
    encodeAuthHandoff(createAuthHandoff(organizationId)),
  );
}

export function readAuthHandoff() {
  return decodeAuthHandoff(window.sessionStorage.getItem(AUTH_HANDOFF_STORAGE_KEY));
}

export function clearAuthHandoff() {
  window.sessionStorage.removeItem(AUTH_HANDOFF_STORAGE_KEY);
}
