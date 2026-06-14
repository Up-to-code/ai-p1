"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useAccountContext } from "@/domains/auth";
import { useRouter } from "@/i18n/routing";
import { usePathname } from "next/navigation";

export function useProjectSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeProjectId, setActiveProjectId } = useWorkspaceStore();
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

  const isGlobalMode = !activeProjectId;

  const switchProject = useCallback(
    (projectId: string) => {
      setActiveProjectId(projectId);
      if (pathname.includes("/projects/")) {
        const pathParts = pathname.split("/");
        const projectsIndex = pathParts.indexOf("projects");
        const currentTab = pathParts[projectsIndex + 2] || "overview";
        router.push(`/projects/${projectId}/${currentTab}`);
      }
    },
    [pathname, setActiveProjectId, router],
  );

  const switchToGlobal = useCallback(() => {
    setActiveProjectId(null);
    if (pathname.includes("/projects/")) {
      router.push("/dashboard");
    }
  }, [pathname, setActiveProjectId, router]);

  // Deep link sync: if URL specifies a project but store doesn't
  useEffect(() => {
    const pathParts = pathname.split("/");
    const projectsIndex = pathParts.indexOf("projects");
    if (projectsIndex !== -1 && pathParts.length > projectsIndex + 1) {
      const idInUrl = pathParts[projectsIndex + 1];
      if (idInUrl !== "create" && idInUrl !== "index" && idInUrl !== activeProjectId) {
        setActiveProjectId(idInUrl);
      }
    }
  }, [pathname, activeProjectId, setActiveProjectId]);

  return {
    projects,
    activeProject,
    activeProjectId,
    isGlobalMode,
    isLoading,
    switchProject,
    switchToGlobal,
  };
}
