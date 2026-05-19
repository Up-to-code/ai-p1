import { useEffect } from "react";
import { useRouter } from "expo-router";

import { loginE2EQaUser } from "@/e2e/store";

export default function E2ELoginQaScreen() {
  const router = useRouter();

  useEffect(() => {
    if (!__DEV__) {
      router.replace("/");
      return;
    }

    loginE2EQaUser();
    router.replace("/(app)");
  }, [router]);

  return null;
}
