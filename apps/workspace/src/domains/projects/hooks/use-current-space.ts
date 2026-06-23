"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useCurrentProjectId } from "./use-current-project-id";
import { useSpacesQuery } from "../api/spaces";
import { useAccountContext } from "@/domains/auth";

/**
 * Reads `?space=<slug>` from the URL and resolves it to a space object.
 * Returns `{ spaceId, spaceSlug, space }` when a valid space is active,
 * or `null` when at the project-global level (no ?space= or invalid slug).
 */
export function useCurrentSpace() {
  const searchParams = useSearchParams();
  const spaceSlug = searchParams.get("space");
  const projectId = useCurrentProjectId();
  const account = useAccountContext();
  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const spaces = useSpacesQuery(orgId, projectId ?? undefined);
  const spaceList = spaces ?? [];

  return useMemo(() => {
    if (!spaceSlug || !projectId) return null;
    const match = spaceList.find((s) => s.slug === spaceSlug);
    if (!match) return null;
    return { spaceId: match.id, spaceSlug: match.slug, space: match };
  }, [spaceSlug, projectId, spaceList]);
}
