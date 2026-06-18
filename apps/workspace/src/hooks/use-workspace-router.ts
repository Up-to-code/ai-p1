"use client";

/**
 * useWorkspaceRouter — wraps the next-intl router.
 *
 * push() and replace() automatically forward all persistent workspace URL
 * params (project, mode, threadId, …) to the destination, matching
 * WorkspaceLink behaviour.
 *
 * Both methods accept an optional second argument `extraParams` to force
 * specific param values onto the destination URL (they always override):
 *
 *   const router = useWorkspaceRouter();
 *   router.push("/dashboard", { extraParams: { mode: "ws" } });
 *
 * Which params are persisted is configured in src/lib/workspace-nav-params.ts.
 */

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { forwardPersistentParams } from "@/lib/workspace-nav-params";

type RouterOptions = Parameters<ReturnType<typeof useRouter>["push"]>[1];

interface WorkspaceNavOptions extends Omit<RouterOptions extends object ? RouterOptions : object, never> {
  extraParams?: Record<string, string>;
}

export function useWorkspaceRouter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const push = useCallback(
    (href: string, { extraParams, ...options }: WorkspaceNavOptions = {}) =>
      router.push(forwardPersistentParams(href, searchParams, extraParams), options as RouterOptions),
    [router, searchParams],
  );

  const replace = useCallback(
    (href: string, { extraParams, ...options }: WorkspaceNavOptions = {}) =>
      router.replace(forwardPersistentParams(href, searchParams, extraParams), options as RouterOptions),
    [router, searchParams],
  );

  return { ...router, push, replace };
}
