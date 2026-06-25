"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { writeAuthHandoff } from "@/domains/auth";
import { selectExistingOrganization, type AuthResult } from "@/domains/auth/organization-selection";
import type { BetterAuthOrganization } from "../lib/types";

type OrganizationAuthClient = typeof authClient & {
  organization: {
    setActive: (input: { organizationId: string }) => Promise<AuthResult<BetterAuthOrganization | null>>;
  };
};

const organizationApi = authClient as OrganizationAuthClient;

/** Switches the active organization from the sidebar workspace list. */
export function useOrganizationSwitch(activeOrganizationId: string) {
  const locale = useLocale();
  const pathname = usePathname();
  const [switchingOrganizationId, setSwitchingOrganizationId] = useState<string | null>(null);

  async function switchOrganization(organizationId: string) {
    if (organizationId === activeOrganizationId || switchingOrganizationId) return;

    setSwitchingOrganizationId(organizationId);

    try {
      await selectExistingOrganization({
        organizationId,
        setActive: organizationApi.organization.setActive,
        navigate: (href, selectedOrganizationId) => {
          writeAuthHandoff(selectedOrganizationId);
          window.location.replace(href);
        },
        nextHref: `/${locale}${pathname}`,
      });
    } catch {
      setSwitchingOrganizationId(null);
    }
  }

  return { switchingOrganizationId, switchOrganization };
}
