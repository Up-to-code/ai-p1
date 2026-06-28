"use client";

/**
 * WorkspaceLink — drop-in replacement for the next-intl Link.
 *
 * Automatically forwards all "persistent" workspace URL params (project, mode,
 * threadId, …) to every destination href so navigating between pages never
 * loses the active project context, AI mode, or any other ambient state.
 *
 * Extra API on top of the standard Link props:
 *
 *   extraParams?: Record<string, string>
 *     Additional query params to merge into the destination URL. These are
 *     applied AFTER persistent param forwarding and always win. Use when a
 *     specific link needs to force a param value, e.g.:
 *
 *       // Go to workspace and force mode=ws regardless of current mode
 *       <WorkspaceLink href="/ws" extraParams={{ mode: "ws" }}>
 *         AI Assistant
 *       </WorkspaceLink>
 *
 *       // Go to tasks scoped to a specific project
 *       <WorkspaceLink href="/tasks" extraParams={{ project: someId }}>
 *         Project tasks
 *       </WorkspaceLink>
 *
 *     Set a value to "" to explicitly remove that param from the destination.
 *
 * Which params are persisted and to which paths is configured centrally in
 * src/lib/workspace-nav-params.ts — add new params there, nothing here changes.
 */

import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import type { ComponentProps } from "react";
import { forwardPersistentParams } from "@/lib/workspace-nav-params";

type BaseLinkProps = ComponentProps<typeof Link>;

type WorkspaceLinkProps = BaseLinkProps & {
  /** Extra params to force onto the destination URL (override everything). */
  extraParams?: Record<string, string>;
};

export function WorkspaceLink({ href, extraParams, ...props }: WorkspaceLinkProps) {
  const searchParams = useSearchParams();

  const resolvedHref =
    typeof href === "string"
      ? (forwardPersistentParams(href, searchParams, extraParams) as BaseLinkProps["href"])
      : href;

  return <Link href={resolvedHref} {...props} />;
}
