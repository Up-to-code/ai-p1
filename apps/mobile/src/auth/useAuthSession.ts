import { useEffect, useMemo, useState } from "react";

import { authClient, isAuthConfigured } from "@/auth/authClient";
import { useAppStore } from "@/store";

export function useAuthSession() {
  const session = authClient.useSession();
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const e2eForceAuthScreen = useAppStore((state) => state.e2eForceAuthScreen);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eQaUser = useAppStore((state) => state.e2eQaUser);
  const configured = isAuthConfigured();

  useEffect(() => {
    if (!configured || !session.isPending) {
      setSessionTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => setSessionTimedOut(true), 8000);
    return () => clearTimeout(timeout);
  }, [configured, session.isPending]);

  return useMemo(
    () => {
      if (e2eQaMode && e2eQaUser) {
        return {
          ...session,
          isReady: true,
          isAuthenticated: true,
          isAnonymous: false,
          canAccessApp: true,
          canUseAi: true,
          canUpgrade: false,
          user: e2eQaUser,
        };
      }

      const rawUser = session.data?.user ?? null;
      const isAnonymous = false;
      const rawHasSession = configured ? Boolean(session.data?.session) : false;
      const hasSession = e2eForceAuthScreen ? false : rawHasSession;
      const canAccessApp = hasSession;
      const user = hasSession ? rawUser : null;

      return {
        ...session,
        isReady: !configured || !session.isPending || sessionTimedOut,
        isAuthenticated: hasSession,
        isAnonymous,
        canAccessApp,
        canUseAi: hasSession,
        canUpgrade: false,
        user,
      };
    },
    [configured, e2eForceAuthScreen, e2eQaMode, e2eQaUser, session, sessionTimedOut],
  );
}
