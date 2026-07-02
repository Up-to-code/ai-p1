// New AuthSession module (deep module)
export { 
  AuthSessionProvider, 
  useAuthSession, 
  useOptionalAuthSession, 
  useOrgId, 
  useUserId,
  useIsAuthenticated,
  type AuthSession,
  type NotificationPreferences,
} from "./auth-session";

// Legacy exports (deprecated - use AuthSession instead)
export { AccountProvider, useAccountContext, useOptionalAccountContext } from "./hooks/use-account-context";

// Auth handoff utilities
export { clearAuthHandoff, readAuthHandoff, writeAuthHandoff } from "./auth-handoff";

// Workspace status types
export type { WorkspaceStatus } from "./workspace-status";
