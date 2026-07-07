/**
 * Workspace app links for marketing CTAs.
 * Marketing remains public; Workspace is the authenticated app.
 */

const workspaceBaseUrl =
  process.env.NEXT_PUBLIC_WORKSPACE_URL ?? "https://app.qentrah.com";

type WorkspaceLocale = "en" | "ar";

function normalizeWorkspaceLocale(locale?: string): WorkspaceLocale {
  return locale === "ar" ? "ar" : "en";
}

function localizedWorkspacePath(locale: string | undefined, path = ""): string {
  const workspaceLocale = normalizeWorkspaceLocale(locale);
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${workspaceLocale}/${cleanPath}` : workspaceLocale;
}

/**
 * Workspace app links
 */
export const workspaceLinks = {
  /** Workspace home/dashboard */
  home: `${workspaceBaseUrl}/en`,

  /** Sign in page */
  signIn: `${workspaceBaseUrl}/en/sign-in`,

  /** Sign up page */
  signUp: `${workspaceBaseUrl}/en/sign-up`,

  /** Billing/subscription page */
  billing: `${workspaceBaseUrl}/en/billing`,

  /** Workspace dashboard */
  dashboard: `${workspaceBaseUrl}/en/dashboard`,

  /** Settings */
  settings: `${workspaceBaseUrl}/en/settings`,

  /** Projects */
  projects: `${workspaceBaseUrl}/en/projects`,

  /** Clients */
  clients: `${workspaceBaseUrl}/en/clients`,
} as const;

/**
 * Get workspace URL with optional path
 */
export function getWorkspaceUrl(path = ""): string {
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${workspaceBaseUrl}/${cleanPath}` : workspaceBaseUrl;
}

/**
 * Get workspace URL using the active marketing locale.
 * Workspace supports en/ar, so unsupported marketing locales fall back to en.
 */
export function getLocalizedWorkspaceUrl(locale: string | undefined, path = ""): string {
  return `${workspaceBaseUrl}/${localizedWorkspacePath(locale, path)}`;
}
