export function organizationApiBaseUrl(organizationId: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/api/v1/partner/organizations/${encodeURIComponent(organizationId)}`;
}

export function organizationApiStarterRequest(apiBaseUrl: string, apiKey: string) {
  return `curl -H "Authorization: Bearer ${apiKey}" "${apiBaseUrl}/me"`;
}