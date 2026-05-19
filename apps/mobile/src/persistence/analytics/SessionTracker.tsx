import { PropsWithChildren, useEffect, useRef } from "react";
import { usePathname } from "expo-router";

import { track } from "@/persistence/analytics/track";
import {
  shouldTrackAppOpen,
  shouldTrackScreenView,
} from "@/persistence/analytics/sessionTrackerState";
import { useAppStore } from "@/store";

export function SessionTracker({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const openedRef = useRef(false);
  const setCurrentRoute = useAppStore((state) => state.setCurrentRoute);
  const sessionId = useAppStore((state) => state.sessionId);

  useEffect(() => {
    if (!openedRef.current && shouldTrackAppOpen(sessionId)) {
      openedRef.current = true;
      track("app_open", { sessionId });
    }
  }, [sessionId]);

  useEffect(() => {
    setCurrentRoute(pathname);
    if (shouldTrackScreenView(sessionId, pathname)) {
      track("screen_view", { sessionId, route: pathname });
    }
  }, [pathname, sessionId, setCurrentRoute]);

  return children;
}
