/**
 * Workspace app links for marketing CTAs.
 * Marketing remains public; Workspace is the authenticated app.
 */

const workspaceBaseUrl =
  process.env.NEXT_PUBLIC_WORKSPACE_URL ?? "https://app.qentrah.com";

/**
 * Workspace app links
 */
export const workspaceLinks = {
  /** Workspace home/dashboard */
  home: workspaceBaseUrl,

  /** Sign in page */
  signIn: `${workspaceBaseUrl}/sign-in`,

  /** Sign up page */
  signUp: `${workspaceBaseUrl}/sign-up`,

  /** Billing/subscription page */
  billing: `${workspaceBaseUrl}/billing`,

  /** Workspace dashboard */
  dashboard: `${workspaceBaseUrl}/dashboard`,

  /** Settings */
  settings: `${workspaceBaseUrl}/settings`,

  /** Projects */
  projects: `${workspaceBaseUrl}/projects`,

  /** Clients */
  clients: `${workspaceBaseUrl}/clients`,
} as const;

/**
 * Get workspace URL with optional path
 */
export function getWorkspaceUrl(path = ""): string {
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${workspaceBaseUrl}/${cleanPath}` : workspaceBaseUrl;
}
