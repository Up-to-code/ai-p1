import { useMemo } from "react";

import { authClient, isAuthConfigured } from "@/auth/authClient";
import { useAppStore } from "@/store";

export function useAuthSession() {
  const session = authClient.useSession();
  const e2eForceAuthScreen = useAppStore((state) => state.e2eForceAuthScreen);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eQaUser = useAppStore((state) => state.e2eQaUser);

  return useMemo(
    () => {
      if (e2eQaMode && e2eQaUser) {
        return {
          ...session,
          isReady: true,
          isAuthenticated: true,
          isAnonymous: false,
          isGuest: false,
          canAccessApp: true,
          canUseAi: true,
          canUpgrade: false,
          user: e2eQaUser,
        };
      }

      const configured = isAuthConfigured();
      const user = session.data?.user ?? null;
      const isAnonymous = false;
      const hasSession = configured ? Boolean(session.data?.session) : true;
      const canAccessApp = hasSession;

      return {
        ...session,
        isReady: !configured || !session.isPending,
        isAuthenticated: hasSession,
        isAnonymous,
        isGuest: false,
        canAccessApp: e2eForceAuthScreen ? hasSession : canAccessApp,
        canUseAi: hasSession,
        canUpgrade: false,
        user,
      };
    },
    [e2eForceAuthScreen, e2eQaMode, e2eQaUser, session],
  );
}
