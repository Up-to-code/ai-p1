"use client";

import { createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useOrgId } from "@/domains/auth";
import { useWorkspaceSpacesQuery, type Space } from "@/domains/spaces/api/spaces";
import { normalizeCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import type { NavState, NavLevel, NavActions } from "./types";

interface NavigationContextValue extends NavState, NavActions {}

const NavigationContext = createContext<NavigationContextValue | null>(null);

function getLevel(projectId: string | null, spaceSlug: string | null): NavLevel {
  if (projectId) return "project";
  if (spaceSlug) return "space";
  return "workspace";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const orgId = useOrgId();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const spaceSlug = searchParams.get("space");
  const projectId = normalizeCurrentProjectId(searchParams.get("project"));

  const level = useMemo(() => getLevel(projectId, spaceSlug), [projectId, spaceSlug]);

  const spaces = useWorkspaceSpacesQuery(orgId ?? undefined);

  const activeSpace = useMemo<Space | null>(
    () => (spaces && spaceSlug ? spaces.find((s) => s.slug === spaceSlug) ?? null : null),
    [spaces, spaceSlug],
  );

  const setSpace = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set("space", slug);
      } else {
        params.delete("space");
      }
      params.delete("project");
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}` as never);
    },
    [router, pathname, searchParams],
  );

  const setProject = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("project", id);
      } else {
        params.delete("project");
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}` as never);
    },
    [router, pathname, searchParams],
  );

  const clearContext = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("space");
    params.delete("project");
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}` as never);
  }, [router, pathname, searchParams]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      orgId,
      spaceId: activeSpace?.id ?? null,
      spaceSlug,
      projectId,
      level,
      activeSpace,
      setSpace,
      setProject,
      clearContext,
    }),
    [orgId, activeSpace, spaceSlug, projectId, level, setSpace, setProject, clearContext],
  );

  return createElement(NavigationContext.Provider, { value }, children);
}

export function useNavigation() {
  const value = useContext(NavigationContext);
  if (!value) {
    throw new Error("useNavigation must be used inside NavigationProvider");
  }
  return value;
}
