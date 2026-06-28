"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useWorkspaceSpacesQuery } from "../api/spaces";
import { useAccountContext } from "@/domains/auth";
import type { Space } from "../api/spaces";

export function useCurrentSpace(): {
  spaceId: string | null;
  spaceSlug: string | null;
  space: Space | null;
} | null {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get("space");
  const account = useAccountContext();
  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const spaces = useWorkspaceSpacesQuery(orgId);
  const spaceList = spaces ?? [];

  return useMemo(() => {
    if (!spaceSlug) return null;
    const match = spaceList.find((s) => s.slug === spaceSlug);
    if (!match) return null;
    return { spaceId: match.id, spaceSlug: match.slug, space: match };
  }, [spaceSlug, spaceList]);
}
