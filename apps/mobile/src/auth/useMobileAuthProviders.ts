import { useMemo } from "react";

import { resolveMobileAuthProviders } from "@/auth/mobileAuthProviders";

export function useMobileAuthProviders() {
  return useMemo(() => resolveMobileAuthProviders(), []);
}
