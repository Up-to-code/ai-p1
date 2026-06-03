# Changes

## 2026-06-03 WorkOS MCP Scope Expansion Plan

- Documented WorkOS MCP Auth as a future OAuth 2.1 authorization layer, not a replacement for Qentrah's MCP tool server.
- Added safe external MCP read scopes for organization members and partner integrations.
- Kept member writes/deletes, role management, organization mutation, billing writes, API key writes, and secret-bearing integration work outside the external MCP adapter.
- Updated lifecycle docs from Better Auth language to WorkOS membership projection language.
- Recorded the phased migration path for a parallel WorkOS/AuthKit bearer-token MCP endpoint.

## 2026-05-28 MCP Connection Lifecycle Depth

- Added `convex/mcp/connectionLifecycle.ts` so Agent link presentation, visible-list filtering, updated ordering, and token TTL calculation live behind a tested lifecycle Module.
- Preserved `convex/mcp/connections.ts` query/mutation exports, permission checks, key creation, list visibility, and response shapes.

## 2026-05-16

- Created lifecycle docs for organization agent links.
- Documented organization permission and delegated permission checks as the correct authorization boundary.
- Removed the platform-admin email allowlist from agent-link create/update/revoke/rotate mutations.
- Removed platform-admin capability gating from the Agent Links UI; organization `apiKey` permissions now drive buttons.

## 2026-05-28 Tool Registry Depth

- Added a shared MCP/Agent tool registry Module so adapter membership, permission requirements, and read-tool classification have one source.
- Kept public MCP catalog behavior stable by filtering registry entries for the MCP adapter, while Agent orchestration opts into the broader Agent adapter surface.
- Replaced the duplicated Convex MCP permission map with a Convex adapter over the shared registry.

## 2026-05-28 Tool Execution Depth

- Added an MCP call execution Module for connection validation, quota reservation, and read/write dispatch while preserving the public `mcp.tools.callTool` export.
- Added an MCP tool input Module so `mcp/tools.ts` no longer owns input parsing, pagination bounds, payload construction, media kind inference, or linked-record assertions.
- Added an MCP read surface Module so `mcp/tools.ts` no longer repeats public Workspace record filtering, search projection, paged result presentation, public media ordering, or calendar event ordering.
- Added shared Workspace business data helpers for MCP record presentation, public/active checks, reference generation, and MCP audit actor fields.
- Extracted Agent response language and prompt policy into `agent-language.ts` while preserving `detectAgentResponseLanguage` through the orchestrator export.

## 2026-05-28 MCP Connection Permission Depth

- Added `convex/mcp/connectionPermissions.ts` so Agent link connection persistence no longer owns default role permissions, custom role parsing, permission records, or action checks inline.
- Preserved MCP connection Convex function names, API key backing behavior, role fallback semantics, custom role parsing behavior, validation behavior, and rate limits.
- Added focused tests for permission records, action checks, role-list parsing, default-before-custom precedence, and malformed custom permission JSON.
