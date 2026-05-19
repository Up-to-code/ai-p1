import { useEffect } from "react";
import { useRouter } from "expo-router";

import { resetE2EAuthState } from "@/e2e/store";

export default function E2EResetAuthScreen() {
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace("/");
      return;
    }

    resetE2EAuthState();
    router.replace("/(auth)");
  }, [router]);

  return null;
}
