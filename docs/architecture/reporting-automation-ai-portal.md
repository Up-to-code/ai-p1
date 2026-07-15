# Reporting, automation, AI, and portal boundaries

## Reports

`reportDefinitions` store presentation configuration, not copied domain data. Reading a report requires three independent decisions: report visibility/grant, Organization/Space/Project scope, and permission for the source domain. Team grants resolve from live Better Auth membership. Sharing a report therefore never expands record access.

## Automations

The existing graph engine remains the only workflow implementation. Domain commands append `automationEvents` in the same Convex transaction as their lifecycle transition. The event processor matches enabled `domain_event` triggers and executes actions through `commandAdapter.ts`.

Every action re-evaluates the automation creator as the execution principal. Task and Document actions also validate Project scope. Webhook and event execution never inherit ambient browser visibility. Sensitive CRM, Delivery, and Finance actions create durable `automationApprovals`; approval resumes at the paused action index and does not replay prior steps.

## AI and MCP

Eve and MCP use the same Organization resource vocabulary as Convex. Finance and Reports are explicit read scopes. Finance writes are classified as admin-approved sensitive operations, and no write tool is advertised until an owned command adapter exists.

## Client portal

Portal sessions store only SHA-256 token hashes and have explicit expiration and revocation. Hono accepts the bearer token, while Convex resolves the session, Portal Identity, Engagement grant, and required capability. Portal access never uses a browser user session or a caller-supplied identity ID.

Portal approval is a Delivery command: it validates the pending approval/resource relationship, applies the lifecycle transition, updates projections, and emits the canonical automation event.
