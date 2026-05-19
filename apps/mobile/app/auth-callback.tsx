import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";

import { useAuthSession } from "@/auth/useAuthSession";
import { api } from "@/persistence/convex/api";
import { AppBootScreen } from "@/shell/components/AppBootScreen";
import { useAppStore } from "@/store";

export default function AuthCallbackScreen() {
  const hydrationComplete = useAppStore((state) => state.hydrationComplete);
  const { canAccessApp, isReady } = useAuthSession();
  const initializeProfile = useMutation(api.auth.public.initializeProfile);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!hydrationComplete || !isReady || !canAccessApp) {
      return;
    }

    let cancelled = false;

    void initializeProfile({})
      .catch(() => null)
      .finally(() => {
        if (!cancelled) {
          setProfileReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canAccessApp, hydrationComplete, initializeProfile, isReady]);

  if (!hydrationComplete || !isReady || (canAccessApp && !profileReady)) {
    return <AppBootScreen />;
  }

  return <Redirect href={canAccessApp ? "/" : "/(auth)"} />;
}
