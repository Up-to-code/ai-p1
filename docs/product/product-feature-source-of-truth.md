# Qentrah AI Product Source Of Truth

Last rebuilt from code: 2026-05-24

This document treats Qentrah as an AI product first. It was rebuilt from the current codebase and should be read as the product map for Qentrah's AI workspace, agent links, tool permissions, memory, and the real estate operating data that the AI can use.

## Product Thesis

Qentrah is an AI-assisted real estate operations workspace. The core product is not only CRUD for projects, units, clients, and calendar. The product is an organization-scoped AI operating layer that can:

- Answer questions about real estate workspace data.
- Search and summarize clients, units, projects, tasks, calendar events, and media.
- Create or update selected operational records when enough fields and permissions are present.
- Expose controlled MCP agent links to external AI tools like ChatGPT, Claude, Grok, Codex, Cursor, and custom agents.
- Track agent runs, safety decisions, tool calls, and memory in Convex.
- Keep organization identity, legal documents, and member removal out of agent control.

The workspace data model remains the AI's tool substrate. Projects, units, clients, calendar events, tasks, media, partner apps, API keys, and billing are product surfaces because they define what the AI can reason over or act on.

Primary code evidence:

- AI chat UI: `apps/workspace/src/components/dashboard/dashboard-chat.tsx`, `apps/workspace/src/components/layout/sidebar.tsx`
- AI chat client: `apps/workspace/src/domains/agents/api/chat.ts`
- AI chat handler: `apps/workspace/src/server/domains/agents/handlers/chat.ts`
- AI orchestrator: `apps/workspace/src/server/domains/agents/services/orchestrator.ts`
- OpenRouter runtime: `apps/workspace/src/server/domains/agents/services/openrouter.ts`
- Tool adapter: `apps/workspace/src/server/domains/agents/services/tool-adapter.ts`
- Agent risk policy: `apps/workspace/src/server/domains/agents/policies/risk-policy.ts`
- MCP transport: `apps/workspace/src/server/protocols/mcp/transports/agent-link.ts`
- MCP tools: `apps/workspace/convex/mcp/tools.ts`
- MCP connections: `apps/workspace/convex/mcp/connections.ts`
- Agent storage: `apps/workspace/convex/agents/read.ts`, `apps/workspace/convex/agents/write.ts`
- Data schema: `apps/workspace/convex/schema.ts`

## AI Product Surfaces

| Surface | Product role | Current code evidence |
| --- | --- | --- |
| In-workspace assistant | AI mode inside the authenticated dashboard, with per-user persistent threads and streaming responses. | `DashboardChat`, `/api/v1/organizations/:organizationId/agents/chat`. |
| Agent run ledger | Records user message, run, phases, tool calls, assistant response, summary, facts, status, model, and error state. | Convex `agentThreads`, `agentMessages`, `agentRuns`, `agentRunSteps`, `agentToolCalls`, `agentMemorySummaries`, `agentMemoryFacts`. |
| Tool execution layer | Lets the model call real estate workspace operations behind permission and schema checks. | `tool-adapter.ts`, `apps/workspace/convex/mcp/tools.ts`. |
| Safety policy | Blocks dangerous organization actions before tool use. | `risk-policy.ts`. |
| MCP agent links | Secure external AI connector URLs that expose only delegated tools. | `organizationMcpConnections`, `/api/mcp/agent/:publicId/:secret`. |
| Agent link management UI | Organization settings area for creating, pausing, revoking, rotating, and scoping agent links. | `organization-screens.tsx`, organization MCP routes. |
| Public MCP docs | Explains connecting external AI tools to Qentrah via MCP. | `apps/workspace/src/app/[locale]/docs/_components/mcp-docs.tsx`. |
| Partner developer MCP | Partners portal has an AI operator area for partner app work. | `apps/partners/app/(portal)/dashboard/mcp/page.tsx`. |

## Core AI User Stories

| User story | Current product behavior |
| --- | --- |
| Ask about workspace data | Dashboard AI can stream responses and use tools when current workspace data is needed. |
| Continue a thread | Chat stores thread ID in the URL and reads previous messages from Convex only when the thread belongs to the current organization user. |
| Search operational records | Agent tools can list/search clients, properties, projects, tasks, calendar, media, and organization context. |
| Create operational records | Tools exist for creating clients, properties, projects, calendar events, tasks, and URL-backed media metadata when permissions allow. |
| Update operational records | Tools exist for updating clients, properties, projects, calendar events, tasks, and completing tasks. |
| Delete operational records | Delete tools exist for clients, properties, projects, calendar events, and tasks, gated by permissions and destructive tool annotations in MCP. |
| Link work together | Tools exist for linking and unlinking clients to units. |
| Use external agents | Admins can create MCP links with resource/action permissions and pass the generated URL to outside AI systems. |
| Audit AI activity | Runs, phases, tool calls, inputs/outputs, errors, and assistant messages are persisted. |
| Remember thread context | Agent memory summaries and memory facts are persisted and revealed through organization encryption helpers. |

## In-Workspace Assistant

Route: `/dashboard?mode=ai`

The dashboard has two product modes:

- Workspace mode: regular operational dashboard.
- AI mode: assistant conversation surface.

The chat UI:

- Reads `threadId` from the URL.
- Lists agent threads created by the current user in the current organization.
- Loads up to 80 persisted messages for a selected thread.
- Creates optimistic local user/assistant messages while a response streams.
- Streams server-sent events from `/api/v1/organizations/:organizationId/agents/chat`.
- Handles event types: `meta`, `status`, `text`, `ag_ui`, `done`, and `error`.
- Updates the URL to keep the active AI thread shareable within the app session.
- Lets the creator delete a thread from the sidebar/history; deletion hard-deletes the thread, messages, runs, tool calls, confirmations, and memory records.
- Tracks first status and first token performance marks.
- Renders Markdown responses.
- Can render AG UI turns through `AgUiTurnRenderer`.

The assistant is organization-scoped and creator-private. Organization membership is required, but one member cannot list, open, continue, or delete another member's AI thread. If no organization is ready, chat requests are skipped or blocked by workspace auth state.

## Agent Request Lifecycle

The current server flow is:

1. Validate request body with `agentChatSchema`.
2. Start a new `agentThread`, or reuse an existing thread only if it belongs to the current authenticated user.
3. Insert the user message as encrypted/redacted organization text.
4. Create an `agentRun` with status `running`.
5. Record an `understand` step.
6. Emit `meta` SSE event with thread and run IDs.
7. Evaluate request risk.
8. If blocked, record policy block, stream the reason, finish the run as blocked, and stop.
9. If OpenRouter is not configured, stream a clear configuration fallback and finish the run.
10. Build allowed tools from organization capabilities.
11. Stream the model response through OpenRouter.
12. Record tool results as they occur.
13. Persist assistant message, memory summary, and memory facts when finishing.

SSE events are encoded as:

- `event: meta`
- `event: status`
- `event: text`
- `event: done`
- `event: error`

The client also supports `ag_ui` events in its type contract, although the inspected orchestrator event type currently lists meta, status, text, done, and error.

## Model Runtime

Provider:

- OpenRouter via `@openrouter/ai-sdk-provider`.

Runtime behavior:

- Uses `agentRuntimeConfig.openRouterApiKey`.
- Uses `agentRuntimeConfig.openRouterModel`.
- Sets `appName` and `appUrl`.
- Uses strict compatibility.
- Sorts provider routing by throughput.
- Uses temperature `0.2`.
- Uses automatic prompt cache options for Anthropic model names.
- Allows tools with `toolChoice: "auto"`.
- Stops after 4 tool steps when tools are available.

If `OPENROUTER_API_KEY` is missing, the agent still starts the run path and returns a fallback that says the AI mode is connected but OpenRouter is not configured.

## Assistant System Behavior

The system prompt frames the assistant as Qentrah's organization agent for a real estate workspace.

The assistant can help with:

- Clients.
- Properties.
- Projects.
- Calendar.
- Tasks.
- Media.

The assistant is instructed to:

- Use tools only when current workspace data or a data change is needed.
- Avoid tool calls for casual domain-word mentions.
- Use conversation memory only when prior context is relevant, the user asks to remember, or the user asks to continue a thread.
- Ask for missing required fields before create/update/delete/schedule/attach/complete actions.
- Never claim a data change unless a tool result explicitly succeeded.
- Keep dangerous organization settings blocked.
- Answer in clean Markdown.
- Avoid raw HTML.

## Language Behavior

The agent detects response language from the latest user message:

- Arabic if Arabic characters dominate enough.
- English if Latin characters dominate.
- Auto otherwise.

Arabic behavior:

- Respond in clean Arabic prose.
- Translate known business labels and statuses when safe.
- Preserve exact stored names, project/property titles, emails, phone numbers, IDs, dates, URLs, references, prices, and legal or record text.
- Translate Markdown table headers and field labels.

English behavior:

- Respond in clean English.
- Preserve exact stored names, phone numbers, emails, IDs, dates, URLs, references, prices, and titles.

## Safety Boundaries

The agent request risk policy blocks these user intents:

| Blocked category | Examples | Product response |
| --- | --- | --- |
| Member deletion | remove/delete/kick/disable member, teammate, user, owner, admin | Tell user member removal must be handled manually in organization settings. |
| Organization identity | rename/change/edit/update organization name, company name, workspace name, legal name, identity | Tell user organization identity changes must be handled manually in organization settings. |
| Legal documents | edit/update/change/delete/remove/rewrite legal, contract, terms, policy, registration, license documents | Tell user legal document changes must be handled manually in organization settings. |

The tool risk policy also blocks:

- Any `member.delete`.
- Any non-read `organization` action.
- Any `legal` resource or tool name containing legal.

## Agent Tool Resources

Tools are organized by resource and action.

Resources:

- `organization`
- `client`
- `property`
- `project`
- `calendar`
- `task`
- `media`

Actions:

- `read`
- `create`
- `update`
- `delete`

The in-workspace AI tool adapter derives available tools from organization capabilities. MCP links derive available tools from the stored permissions on that connection.

## Current Tool Catalog

The lower-level MCP tool permission map currently includes:

| Tool | Resource | Action | Product purpose |
| --- | --- | --- | --- |
| `organization_info` | organization | read | Read organization context. |
| `clients_list` | client | read | List/search clients. |
| `clients_get` | client | read | Read one client. |
| `clients_create` | client | create | Create a client. |
| `clients_update` | client | update | Update a client. |
| `clients_delete` | client | delete | Delete a client. |
| `clients_link_unit` | client | update | Link a client to a unit. |
| `clients_unlink_unit` | client | update | Unlink a client from a unit. |
| `properties_list` | property | read | List/search units. |
| `properties_get` | property | read | Read one unit. |
| `properties_open` | property | read | Open/read a public-safe property view. |
| `properties_create` | property | create | Create a unit. |
| `properties_update` | property | update | Update a unit. |
| `properties_update_field` | property | update | Update one unit field. |
| `properties_delete` | property | delete | Delete a unit. |
| `projects_list` | project | read | List/search projects. |
| `projects_get` | project | read | Read one project. |
| `projects_create` | project | create | Create a project. |
| `projects_update` | project | update | Update a project. |
| `projects_delete` | project | delete | Delete a project. |
| `calendar_list_today` | calendar | read | Read today's calendar events. |
| `calendar_list_range` | calendar | read | Read events in a time range. |
| `calendar_list_month` | calendar | read | Read events in a month. |
| `calendar_get` | calendar | read | Read one calendar event. |
| `calendar_create` | calendar | create | Create a calendar event. |
| `calendar_update` | calendar | update | Update a calendar event. |
| `calendar_delete` | calendar | delete | Delete a calendar event. |
| `tasks_list` | task | read | List/search client tasks. |
| `tasks_get` | task | read | Read one task. |
| `tasks_create` | task | create | Create a task. |
| `tasks_update` | task | update | Update a task. |
| `tasks_complete` | task | update | Complete a task. |
| `tasks_delete` | task | delete | Delete a task. |
| `media_list` | media | read | List media on a resource. |
| `media_attach_url` | media | create | Attach URL-backed image/document/video metadata to a resource. |

Read-only tools are explicitly tracked in `mcpReadToolNames`.

## Tool Input Contracts

The tool adapter validates tool inputs with Zod before execution.

Important input requirements:

- Client create/update needs name, type, contact, phone, age, nationality, generation, budget, property interest, status, visibility, pipeline stage/order, priority, next action, and optional issue.
- Property create/update needs title, project link/name, city, type, status, visibility, purpose, price, area, bedrooms, bathrooms, and description.
- Project create/update needs name, developer, city, area, type, unit types, status, visibility, units, price range, optional average price, optional project price rows, REGA/plan/plot/postal fields, and description.
- Calendar create/update needs title, owner, start/end, type, status, optional client/property/project/task links, location, notes, and custom fields.
- Task create/update needs client ID, title, status, visibility, priority, due date, optional property/project/calendar links, and notes.
- Media attach needs resource type, resource ID, URL, name, optional MIME type, size, kind, and cover flag.

## Memory And Privacy

Agent storage uses redaction plus organization encryption helpers:

- User messages are inserted with redacted content plus encrypted content.
- Assistant messages are inserted with redacted content plus encrypted content.
- Tool input/output previews are redacted and encrypted when recorded.
- Memory summaries are encrypted and revealed through organization text helpers.
- Memory facts are encrypted and revealed through organization text helpers.

Agent memory tables:

- `agentMemorySummaries`: per-thread summary, encrypted summary, redaction flag, message count, updated time.
- `agentMemoryFacts`: organization/thread facts, encrypted fact, source message, created/updated time.

Current fact extraction is narrow: `memoryFactsFrom` only extracts facts when the message contains "remember".

## Run And Audit Model

The AI run ledger exists to make agent behavior inspectable.

Tables:

- `agentThreads`: one conversation thread per organization and creator; thread reads and continuation are creator-private.
- `agentMessages`: user, assistant, system, and tool messages.
- `agentRuns`: one model execution/run, with status `running`, `completed`, `failed`, or `blocked`.
- `agentRunSteps`: phase-level audit.
- `agentToolCalls`: tool-level audit.

Run step phases:

- `understand`
- `retrieve`
- `plan`
- `policy`
- `execute`
- `summarize`
- `memory`

Step statuses:

- `started`
- `completed`
- `blocked`
- `failed`

Tool call statuses:

- `allowed`
- `blocked`
- `failed`

## MCP Agent Links

MCP links are external AI connectors for an organization.

Endpoint:

- `POST /api/mcp/agent/:publicId/:secret`

Rejected methods:

- `GET`
- `DELETE`

MCP behavior:

- Validates `publicId` and `secret` through Convex.
- Rejects unavailable links with JSON-RPC unauthorized errors.
- Registers only tools allowed by the connection permissions.
- Adds destructive hints for destructive tools.
- Exposes connection instructions through tool metadata.
- Adds a `tools_allowed` tool so the external agent can inspect available work.
- Uses stateless `WebStandardStreamableHTTPServerTransport`.
- Closes the MCP server after each request.

MCP connection fields:

- Public ID.
- Key ID and last four characters.
- Name.
- Optional instructions.
- Permissions.
- Status: `active`, `paused`, `draft`, `revoked`.
- Created by user.
- Created/updated/last used timestamps.
- Expiry.
- Usage count.
- Rate-limit window and count.
- Revocation time.

Rate limit constant:

- `MAX_TOOL_CALLS_PER_MINUTE = 120`

## MCP Permission Delegation

Default role-derived MCP permissions:

| Role | Default MCP ability |
| --- | --- |
| owner | Organization read/update/delete plus full client/task/project/property/calendar/media CRUD. |
| admin | Organization read plus full client/task/project/property/calendar/media CRUD. |
| member | Organization, client, task, project, property, calendar, and media read only. |

When creating/filtering permissions, code checks what the current user can delegate. Custom organization roles can also contribute permission JSON.

Important product rule: agent links should never grant more than the creator/manager can actually use.

## Agent Link Management

Organization settings currently includes an `agentLinks` tab.

Supported route operations:

- `GET /api/v1/organizations/:organizationId/mcp-connections`
- `POST /api/v1/organizations/:organizationId/mcp-connections`
- `PATCH /api/v1/organizations/:organizationId/mcp-connections/:connectionId`
- `DELETE /api/v1/organizations/:organizationId/mcp-connections/:connectionId`
- `POST /api/v1/organizations/:organizationId/mcp-connections/:connectionId/rotate`

Product capabilities:

- Create a named link.
- Add instructions.
- Select resource/action permissions.
- Pause/update/revoke.
- Rotate secret.
- Track last used, usage count, expiry, and status.

## AI Context Data

The AI's useful context comes from organization-scoped operational data.

| Domain | AI can use it for |
| --- | --- |
| Organization profile | Explain the workspace identity, constraints, and allowed work context. |
| Projects | Search projects, summarize inventory, create/update project records, inspect status and pricing. |
| Units/properties | Search units, compare availability, update unit fields, attach media, connect interested clients. |
| Clients | Search CRM records, summarize pipeline, create/update clients, move stages, link clients to units. |
| Client tasks | List/complete/create follow-up work. |
| Calendar | Read schedule, create/update/delete events, connect events to clients/properties/projects/tasks. |
| Media | List resource media and attach external URL-backed media metadata. |
| Activity | Product has audit events, useful for future "what changed" AI answers. |
| Partner connections | Product can reason about connected apps and scopes, though direct agent tool coverage is centered on real estate operations. |

## Non-AI Workspace Features As AI Substrate

These workspace modules matter because they define what the AI can operate on.

| Module | Routes | AI relevance |
| --- | --- | --- |
| Dashboard | `/dashboard` | AI mode entry point plus operational summary. |
| Projects | `/projects`, `/projects/create`, `/projects/:id`, `/projects/:id/edit` | Project search/create/update/delete tools. |
| Units | `/properties`, `/properties/create`, `/properties/:id`, `/properties/:id/edit` | Property search/create/update/delete tools. |
| Clients | `/clients`, `/clients/create`, `/clients/:id`, `/clients/:id/edit` | CRM search/create/update/delete and pipeline context. |
| Calendar | `/calendar` | Event read/create/update/delete tools. |
| Activity | `/activity` | Human-readable audit history, future AI audit context. |
| Organization settings | `/settings/organization` | Agent link, API key, role, invite, member, and org profile control plane. |
| Billing | `/billing` | Subscription state and Tamara checkout, not currently an AI tool target. |
| Integrations | `/web-apps`, `/web-apps/:id` | Partner app connection catalog, external app access layer. |
| Profile | `/profile/settings` | User profile/avatar, not currently an AI tool target. |

## Partner And External App AI Relevance

Partner app infrastructure extends the AI product in two ways:

1. External business apps can integrate with Qentrah through OAuth and scoped resource APIs.
2. External AI systems can integrate through MCP agent links.

Partner resource API:

- `/api/v1/partner/organizations/:organizationId/me`
- `/api/v1/partner/organizations/:organizationId/clients`
- `/api/v1/partner/organizations/:organizationId/clients/:clientId`
- `/api/v1/partner/organizations/:organizationId/properties`
- `/api/v1/partner/organizations/:organizationId/properties/:propertyId`
- `/api/v1/partner/organizations/:organizationId/projects`
- `/api/v1/partner/organizations/:organizationId/projects/:projectId`
- `/api/v1/partner/organizations/:organizationId/tasks`
- `/api/v1/partner/organizations/:organizationId/tasks/:taskId`
- `/api/v1/partner/organizations/:organizationId/calendar`
- `/api/v1/partner/organizations/:organizationId/calendar/:eventId`
- `/api/v1/partner/organizations/:organizationId/media`
- `/api/v1/partner/organizations/:organizationId/webhooks/inbound`

The Partners portal also has a partner-side MCP area titled "AI operator", focused on helping create, update, delete, inspect, and submit partner apps.

## Security And Governance

Current AI governance controls:

- Organization-scoped data access.
- Better Auth organization permission checks for reading agent threads/messages.
- Capability-derived tool permissions for in-workspace AI tools.
- Delegated permissions for MCP links.
- API-key backed MCP secret validation.
- Rate limit state on MCP connections.
- Explicit risk policy for member removal, organization identity, and legal documents.
- Encrypted/redacted agent messages, memory, and tool previews.
- Tool-call audit records with action/resource/status/error.
- Destructive hints on MCP tools marked destructive.

## Product Gaps And Caveats From Code

These are observed from code, not roadmap claims:

- The chat client type supports `ag_ui` SSE events, but the inspected orchestrator event union currently does not emit `ag_ui`.
- The agent tool adapter imports MCP tool catalog definitions, so in-workspace AI and MCP appear intentionally aligned around the same operational tool surface.
- `memoryFactsFrom` only extracts memory when the user says "remember"; broader automatic memory extraction is not present in the inspected code.
- The webhooks tab in integrations is mostly placeholder UI, though webhook data model and route pieces exist.
- Billing is implemented as a workspace feature but is not currently part of the AI tool catalog.
- Organization member removal, organization identity edits, and legal document edits are intentionally blocked for agents.
- Onboarding contains a legal docs form file, but the current onboarding page uses only company, brand, and team steps.
- The team invite onboarding form currently simulates submission instead of calling the invite API.

## Product Positioning Summary

Qentrah's AI product is best described as:

An organization-scoped real estate operations agent that works inside Qentrah and through external MCP links. It can read and act on approved workspace records, keeps a persistent and auditable run history, uses explicit permission boundaries, encrypts/redacts sensitive agent data, and blocks high-risk organization governance actions.

The non-AI workspace remains essential: it is the human control plane and source of truth for the AI's tools, permissions, and business context.
