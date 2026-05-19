import { useEffect, useMemo } from "react";

import { authClient, isAuthConfigured } from "@/auth/authClient";
import { useAppStore } from "@/store";

export function useAuthSession() {
  const session = authClient.useSession();
  const e2eForceAuthScreen = useAppStore((state) => state.e2eForceAuthScreen);
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eQaUser = useAppStore((state) => state.e2eQaUser);
  const guestMode = useAppStore((state) => state.guestMode);
  const comparePropertyIds = useAppStore((state) => state.comparePropertyIds);
  const activeThreadId = useAppStore((state) => state.activeThreadId);
  const guestMirrorComparePropertyIds = useAppStore((state) => state.guestMirrorComparePropertyIds);
  const guestMirrorActiveThreadId = useAppStore((state) => state.guestMirrorActiveThreadId);
  const setGuestMode = useAppStore((state) => state.setGuestMode);
  const setComparePropertyIds = useAppStore((state) => state.setComparePropertyIds);
  const setActiveThreadId = useAppStore((state) => state.setActiveThreadId);
  const clearGuestMirror = useAppStore((state) => state.clearGuestMirror);

  useEffect(() => {
    const user = session.data?.user ?? null;
    const isAnonymous = Boolean(user && "isAnonymous" in user && user.isAnonymous);

    if (isAnonymous && !guestMode) {
      setGuestMode(true);
    }
  }, [guestMode, session.data?.user, setGuestMode]);

  useEffect(() => {
    const user = session.data?.user ?? null;
    const isAnonymous = Boolean(user && "isAnonymous" in user && user.isAnonymous);

    if (!guestMode || !session.data?.session || isAnonymous) {
      return;
    }

    const mergedCompareIds = Array.from(
      new Set([...comparePropertyIds, ...guestMirrorComparePropertyIds]),
    ).slice(-2);

    if (mergedCompareIds.length !== comparePropertyIds.length
      || mergedCompareIds.some((id, index) => id !== comparePropertyIds[index])) {
      setComparePropertyIds(mergedCompareIds);
    }

    if (!activeThreadId && guestMirrorActiveThreadId) {
      setActiveThreadId(guestMirrorActiveThreadId);
    }

    clearGuestMirror();
    setGuestMode(false);
  }, [
    activeThreadId,
    clearGuestMirror,
    comparePropertyIds,
    guestMirrorActiveThreadId,
    guestMirrorComparePropertyIds,
    guestMode,
    session.data?.session,
    session.data?.user,
    setActiveThreadId,
    setComparePropertyIds,
    setGuestMode,
  ]);

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
      const isAnonymous = configured
        ? Boolean(user && "isAnonymous" in user && user.isAnonymous)
        : false;
      const hasSession = configured ? Boolean(session.data?.session) : true;
      const isGuest = guestMode || isAnonymous;
      const canAccessApp = hasSession || guestMode;

      return {
        ...session,
        isReady: !configured || !session.isPending,
        isAuthenticated: hasSession,
        isAnonymous,
        isGuest,
        canAccessApp: e2eForceAuthScreen ? hasSession : canAccessApp,
        canUseAi: hasSession,
        canUpgrade: isGuest,
        user,
      };
    },
    [e2eForceAuthScreen, e2eQaMode, e2eQaUser, guestMode, session],
  );
}
