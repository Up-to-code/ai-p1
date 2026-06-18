"use client";

import { useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { useCurrentProjectId } from "./use-current-project-id";

export function useProjectSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProjectId = useCurrentProjectId();

  const account = useAccountContext();
  const activeOrganizationId =
    account.workspace.status === "ready"
      ? account.workspace.organizationId ?? undefined
      : undefined;

  const projectsQuery = useProjectOptionsQueryResult(activeOrganizationId);
  const projects = projectsQuery.data ?? [];
  const isLoading = projectsQuery.queryStatus === "loading";

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId],
  );

  const isGlobalMode = activeProjectId === null;

  /**
   * Build a new URL that keeps all current search params except `project`,
   * which is replaced with the new value (or removed for global mode).
   */
  function buildProjectUrl(projectId: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (projectId) {
      params.set("project", projectId);
    } else {
      params.delete("project");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  /** Switch to a project — stay on the current page, just update ?project= */
  const switchProject = useCallback(
    (projectId: string) => {
      router.push(buildProjectUrl(projectId));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, searchParams, router],
  );

  /** Go back to global (no project) — stay on the current page, remove ?project= */
  const switchToGlobal = useCallback(() => {
    router.push(buildProjectUrl(null));
  }, [pathname, searchParams, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetchProjects = useCallback(() => {
    projectsQuery.refetch();
  }, [projectsQuery]);

  return {
    projects,
    activeProject,
    activeProjectId,
    isGlobalMode,
    isLoading,
    switchProject,
    switchToGlobal,
    refetchProjects,
  };
}
