# Qentrah MCP Gateway

Standalone Hono gateway for `https://mcp.qentrah.com/mcp`. Better Auth remains on
`https://app.qentrah.com/api/auth`; this service accepts bearer access tokens only.

## Required production environment

- `MCP_RESOURCE_URL=https://mcp.qentrah.com/mcp`
- `BETTER_AUTH_URL=https://app.qentrah.com/api/auth`
- `CONVEX_URL=<Qentrah Convex deployment URL>`
- `MCP_ALLOWED_ORIGINS=https://app.qentrah.com`
- `UPSTASH_REDIS_REST_URL=<distributed rate-limit Redis URL>`
- `UPSTASH_REDIS_REST_TOKEN=<distributed rate-limit Redis token>`
- `OPENAI_APPS_CHALLENGE=<token from the OpenAI plugin submission portal>`

Production readiness fails closed when the distributed anonymous rate limiter is
not configured. Authenticated client, grant, and tool limits are enforced
atomically by Convex.

The OpenAI challenge value must be copied exactly from the submission portal.
The gateway serves it as plain text at
`/.well-known/openai-apps-challenge` for domain verification.

## Commands

```bash
npm run dev --workspace @qentrah/mcp-gateway
npm run typecheck --workspace @qentrah/mcp-gateway
npm test --workspace @qentrah/mcp-gateway
```
