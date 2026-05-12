"use client";

import { useMemo } from "react";
import type { PartnerAppSummary } from "@/server/partnerApps";

export function usePartnerAppForm(app?: PartnerAppSummary) {
  const initialScopes = useMemo(
    () => app?.allowedScopes ?? ["organization:read", "client:read", "property:read"],
    [app?.allowedScopes],
  );

  return {
    initialScopes,
    initialRedirectUris: app?.redirectUris ?? [],
  };
}
