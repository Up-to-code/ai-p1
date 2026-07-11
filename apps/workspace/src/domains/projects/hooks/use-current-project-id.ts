"use client";

import { useSearchParams } from "next/navigation";

const INVALID_ROUTE_PARAM_VALUES = new Set(["undefined", "null"]);

export function normalizeCurrentProjectId(value: string | null): string | null {
  const projectId = value?.trim();
  if (!projectId || INVALID_ROUTE_PARAM_VALUES.has(projectId.toLowerCase())) return null;
  return projectId;
}

/**
 * Returns the active projectId from the `?project=<id>` URL search param,
 * or null when in global mode (no param present).
 *
 * This is the single source of truth for "which project context am I in?".
 * It works on ANY page — /tasks, /calendar, /opportunities, /clients, etc.
 * No path changes, no store, no sync effects.
 */
export function useCurrentProjectId(): string | null {
  const searchParams = useSearchParams();
  return normalizeCurrentProjectId(searchParams.get("project"));
}
