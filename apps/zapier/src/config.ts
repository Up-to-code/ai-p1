export const defaultBaseUrl = 'https://app.qentrah.com';

export function qentrahApiBase(authData: Record<string, unknown>) {
  const configuredBaseUrl = process.env.QENTRAH_BASE_URL;
  const baseUrl = configuredBaseUrl?.trim() || (
    typeof authData.baseUrl === 'string' && authData.baseUrl.trim()
      ? authData.baseUrl.trim()
      : defaultBaseUrl
  );
  const organizationId = String(authData.organizationId ?? '').trim();
  if (!organizationId) throw new Error('Organization ID is required.');
  const parsed = new URL(baseUrl);
  const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalDevelopment)) {
    throw new Error('Qentrah URL must use HTTPS. HTTP is allowed only for localhost development.');
  }
  return `${parsed.origin}/api/v1/partner/organizations/${encodeURIComponent(organizationId)}`;
}
