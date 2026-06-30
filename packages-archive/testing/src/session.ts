import type { SessionContext } from "@qentrah/platform-core/session";
import type { ProfileSummary } from "@qentrah/domain-contracts/profiles";

export function buildSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    userId: "auth-user-1",
    email: "user@qentrah.test",
    name: "Qentrah User",
    role: "broker",
    isAdmin: false,
    isActive: true,
    ...overrides,
  };
}

export function buildProfileSummary(overrides: Partial<ProfileSummary> = {}): ProfileSummary {
  return {
    email: "user@qentrah.test",
    name: "Qentrah User",
    username: "qentrah.user",
    role: "broker",
    showInOffersDirectory: false,
    authProvider: {
      id: "google",
      passwordManaged: false,
    },
    ...overrides,
  };
}
