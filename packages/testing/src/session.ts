import type { SessionContext } from "@anan/platform-core/session";
import type { ProfileSummary } from "@anan/domain-contracts/profiles";

export function buildSessionContext(overrides: Partial<SessionContext> = {}): SessionContext {
  return {
    userId: "auth-user-1",
    email: "user@anan.test",
    name: "Anan User",
    role: "broker",
    isAdmin: false,
    isActive: true,
    ...overrides,
  };
}

export function buildProfileSummary(overrides: Partial<ProfileSummary> = {}): ProfileSummary {
  return {
    email: "user@anan.test",
    name: "Anan User",
    username: "anan.user",
    role: "broker",
    showInOffersDirectory: false,
    authProvider: {
      id: "google",
      passwordManaged: false,
    },
    ...overrides,
  };
}
