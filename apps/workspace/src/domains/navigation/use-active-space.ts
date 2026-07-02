"use client";

import { useMemo } from "react";
import { useAuthSession } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useNavigation } from "./navigation-context";

export function useActiveSpace() {
  const session = useAuthSession();
  const { spaceSlug } = useNavigation();
  const orgId =
    session.workspace.status === "ready"
      ? session.workspace.organizationId ?? undefined
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
