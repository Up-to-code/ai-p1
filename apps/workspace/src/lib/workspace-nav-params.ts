/**
 * workspace-nav-params
 *
 * Declares which URL search params are "persistent" — meaning they survive
 * every navigation within the workspace app and are automatically forwarded
 * by WorkspaceLink and useWorkspaceRouter.
 *
 * Each entry is a config object that controls:
 *   - `key`       The actual URL param name.
 *   - `skipPaths` Path prefixes where this param must NOT be forwarded
 *                 (e.g. the dashboard AI route doesn't need ?project=).
 *
 * To add a new persistent param in the future, just append to PERSISTENT_PARAMS.
 * Nothing else needs to change.
 */

export interface PersistentParamConfig {
  key: string;
  /** Path prefixes that should NOT receive this param. */
  skipPaths?: string[];
}

export const PERSISTENT_PARAMS: PersistentParamConfig[] = [
  {
    // Active project filter — carried on every page so the data context
    // doesn't reset when the user navigates between tasks/calendar/etc.
    // NOTE: /dashboard is NOT skipped — carrying ?project= there is harmless
    // and means the project context survives the AI assistant round-trip.
    key: "project",
    skipPaths: [],
  },
  {
    // AI workspace mode — ws | ai — carried so the topbar toggle stays in sync.
    key: "mode",
    skipPaths: [],
  },
  {
    // Active AI thread — only relevant when mode=ai, harmless otherwise.
    key: "threadId",
    skipPaths: [],
  },
  {
    // Active space filter — carried so space context survives navigation
    // within a project. Cleared when switching projects or going global.
    key: "space",
    skipPaths: [],
  },
];

/**
 * Given a destination href and the current URLSearchParams, returns a new
 * href with all applicable persistent params merged in.
 *
 * Rules:
 * - External URLs (http/https//) are passed through untouched.
 * - Hash-only anchors (#…) are passed through untouched.
 * - Each param is only forwarded if it has a value in `current`.
 * - Each param respects its `skipPaths` list.
 * - `extraParams` are merged in AFTER persistent params — they always win
 *   over both persistent forwarding AND what the destination already has.
 *   Use this when a link needs to force a specific param value, e.g.
 *   { mode: "ws" } on the AI assistant sidebar link.
 * - Existing params in the destination href are preserved and take precedence
 *   over persistent forwarding (but NOT over extraParams).
 */
export function forwardPersistentParams(
  href: string,
  current: URLSearchParams,
  extraParams?: Record<string, string>,
): string {
  // Pass through non-navigable hrefs unchanged
  if (
    href.startsWith("http") ||
    href.startsWith("//") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const [path, existingQuery] = href.split("?");
  const dest = new URLSearchParams(existingQuery ?? "");

  // 1. Forward persistent params (destination existing values win)
  for (const config of PERSISTENT_PARAMS) {
    const value = current.get(config.key);
    if (!value) continue;
    if (config.skipPaths?.some((prefix) => path.startsWith(prefix))) continue;
    if (dest.has(config.key)) continue; // destination wins
    dest.set(config.key, value);
  }

  // 2. Apply extra params last — they always override everything
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value === "" || value === null || value === undefined) {
        dest.delete(key);
      } else {
        dest.set(key, value);
      }
    }
  }

  const query = dest.toString();
  return query ? `${path}?${query}` : path;
}
