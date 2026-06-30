"use client";

import { useMemo } from "react";
import { useAccountContext } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useNavigation } from "./navigation-context";

export function useActiveSpace() {
  const account = useAccountContext();
  const { spaceSlug } = useNavigation();
  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);

  const space = useMemo(
    () => (spaces && spaceSlug ? spaces.find((s) => s.slug === spaceSlug) ?? null : null),
    [spaces, spaceSlug],
  );

  return {
    space,
    spaceId: space?.id ?? null,
    spaceName: space?.name ?? null,
  };
}
