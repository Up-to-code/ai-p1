"use client";

import { useSearchParams } from "next/navigation";

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
  const id = searchParams.get("project");
  if (typeof id === "string" && id.length > 0) return id;
  return null;
}
