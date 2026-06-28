"use client";

import { createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import type { NavState, NavLevel, NavActions } from "./types";

interface NavigationContextValue extends NavState, NavActions {}

const NavigationContext = createContext<NavigationContextValue | null>(null);

function getLevel(projectId: string | null, spaceSlug: string | null): NavLevel {
  if (projectId) return "project";
  if (spaceSlug) return "space";
  return "workspace";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const account = useAccountContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const workspaceId: string | null =
    account.workspace.status === "ready" ? account.workspace.organizationId : null;

  const spaceSlug = searchParams.get("space");
  const projectId = searchParams.get("project");

  const level = useMemo(() => getLevel(projectId, spaceSlug), [projectId, spaceSlug]);

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
      workspaceId,
      spaceId: null,
      spaceSlug,
      projectId,
      level,
      setSpace,
      setProject,
      clearContext,
    }),
    [workspaceId, spaceSlug, projectId, level, setSpace, setProject, clearContext],
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
