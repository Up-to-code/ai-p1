function requiredUrl(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`${name} is required.`);
  const url = new URL(value);
  return url.toString().replace(/\/$/u, "");
}

export type GatewayConfig = ReturnType<typeof gatewayConfig>;

export function gatewayConfig() {
  const resourceUrl = requiredUrl("MCP_RESOURCE_URL", "http://localhost:4100/mcp");
  const authBaseUrl = requiredUrl("BETTER_AUTH_URL", "http://localhost:3000/api/auth");
  const convexUrl = requiredUrl("CONVEX_URL");
  const authIssuerUrl = new URL(authBaseUrl);
  const issuerPath = authIssuerUrl.pathname.replace(/\/$/u, "");

  return {
    port: Number(process.env.PORT ?? 4100),
    resourceUrl,
    authBaseUrl,
    issuer: authBaseUrl,
    authorizationServerMetadataUrl:
      `${authIssuerUrl.origin}/.well-known/oauth-authorization-server${issuerPath}`,
    convexUrl,
    protectedResourceMetadataUrl: `${new URL(resourceUrl).origin}/.well-known/oauth-protected-resource/mcp`,
    allowedOrigins: new Set(
      (process.env.MCP_ALLOWED_ORIGINS ?? "https://app.qentrah.com")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  };
}
