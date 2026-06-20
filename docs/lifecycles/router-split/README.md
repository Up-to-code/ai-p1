# Router Split

## Purpose
Split the 496-line central mega-router into 8 focused per-domain sub-routers.

## Owner
`apps/workspace/src/server/domains/organization/routing/router.ts` (23 lines, mounts sub-routers)

## Sub-routers
| File | Domain | Lines |
|------|--------|-------|
| `domains/organization.ts` | Profile, capabilities, identity, invitations, members, roles, api-keys | 53 |
| `domains/crud.ts` | Read surface + write CRUD for all workspace entities | 89 |
| `domains/notifications.ts` | Notification settings and schedules | 22 |
| `domains/media.ts` | Media attach, folders, CRUD | 16 |
| `domains/mcp.ts` | MCP agent connections | 16 |
| `domains/agents.ts` | Agent chat, confirmations, threads | 20 |
| `domains/partners.ts` | Partner connections, webhook endpoints | 16 |
| `domains/billing.ts` | Billing subscription, usage, checkout, payments | 14 |

## Pattern
Each sub-router is a `new Hono()` with routes defined using full paths (e.g., `/:organizationId/profile`). The main router applies shared middleware, then mounts each sub-router via `.route("/", subRouter)`.
