import { useMobileAuthGate } from "@/auth/mobileAuthGate";

export function useWorkspaceIdentity() {
  const gate = useMobileAuthGate();

  return {
    status: gate.workspaceStatus,
    organizationId: gate.organizationId,
    regions: gate.regions,
    organizations: gate.organizations,
    error: gate.error,
    isReady: gate.workspaceStatus === "ready",
  };
}
