"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthSession } from "@/domains/auth";
import { useWorkspaceSpacesQuery } from "../api/spaces";
import type { Space } from "../api/spaces";

export function useActiveSpace(): {
  space: Space | null;
  spaceId: string | null;
  spaceSlug: string | null;
  isActive: boolean;
} {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get("space");
  const session = useAuthSession();
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
    spaceSlug: spaceSlug ?? null,
    isActive: space !== null,
  };
}
