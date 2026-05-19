import { useEffect } from "react";
import { useRouter } from "expo-router";

import { resetE2EThreadState } from "@/e2e/store";

export default function E2EResetThreadStateScreen() {
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace("/");
      return;
    }

    resetE2EThreadState();
    router.replace("/(app)");
  }, [router]);

  return null;
}
