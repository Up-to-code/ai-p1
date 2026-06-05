import { useMemo } from "react";

import { useMobileAuthGate } from "@/auth/mobileAuthGate";

export function useAuthSession() {
  const gate = useMobileAuthGate();

  return useMemo(
    () => {
      return {
        data: gate.session
          ? {
              session: gate.session,
              user: gate.user,
            }
          : null,
        error: null,
        isPending: !gate.isReady,
        isReady: gate.isReady,
        isAuthenticated: gate.isAuthenticated,
        isAnonymous: false,
        canAccessApp: gate.isAuthenticated,
        canUseAi: gate.isAuthenticated,
        canUpgrade: false,
        user: gate.user,
      };
    },
    [gate],
  );
}
