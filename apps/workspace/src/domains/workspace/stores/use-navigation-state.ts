"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useWorkspaceStore } from "./workspace-store";

export function useNavigationState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orgId = useWorkspaceStore((s) => s.orgId);
  const spaceSlug = useWorkspaceStore((s) => s.spaceSlug);
  const spaceId = useWorkspaceStore((s) => s.spaceId);
  const projectId = useWorkspaceStore((s) => s.projectId);

  const activeView = useMemo(() => {
    const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "";
    return lastSegment === "ws" ? "overview" : lastSegment;
  }, [pathname]);

  const buildPath = useCallback(
    (id: string) => {
      const base = id === "overview" ? "/ws" : `/ws/${id}`;
      const qs = searchParams.toString();
      return qs ? `${base}?${qs}` : base;
    },
    [searchParams],
  );

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path as never);
    },
    [router],
  );

  return { orgId, spaceSlug, spaceId, projectId, activeView, buildPath, navigateTo };
}
