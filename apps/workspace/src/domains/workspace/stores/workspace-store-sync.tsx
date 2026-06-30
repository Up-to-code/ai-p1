"use client";

import { useEffect } from "react";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useWorkspaceStore } from "./workspace-store";

export function WorkspaceStoreSync() {
  const account = useAccountContext();
  const { spaceSlug, projectId } = useNavigation();
  const orgId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? null
      : null;
  const spaces = useWorkspaceSpacesQuery(orgId ?? undefined);
  const activeSpace = spaces?.find((s) => s.slug === spaceSlug) ?? null;

  const store = useWorkspaceStore();

  useEffect(() => {
    store.setOrgId(orgId);
  }, [orgId, store.setOrgId]);

  useEffect(() => {
    store.setSpace(spaceSlug, activeSpace?.id ?? null);
  }, [spaceSlug, activeSpace?.id, store.setSpace]);

  useEffect(() => {
    store.setProjectId(projectId);
  }, [projectId, store.setProjectId]);

  return null;
}
