import { useEffect } from "react";
import { useRouter } from "expo-router";

import { resetE2EUserState } from "@/e2e/store";

export default function E2EResetUserStateScreen() {
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace("/");
      return;
    }

    resetE2EUserState();
    router.replace("/(app)");
  }, [router]);

  return null;
}
