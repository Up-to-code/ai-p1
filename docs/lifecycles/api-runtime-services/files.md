# Files

## Runtime And Contracts

- `packages/platform-core/src/effect-api.ts`: public barrel Interface for typed API errors, Effect cache service, and HTTP rate-limit service.
- `packages/platform-core/src/effect-api-errors.ts`: typed API error Implementation.
- `packages/platform-core/src/effect-api-cache.ts`: Effect cache service Implementation.
- `packages/platform-core/src/effect-api-rate-limit.ts`: HTTP and internal Effect rate-limit Implementation.
- `packages/platform-core/src/index.ts`: public export for shared runtime contracts.
- `apps/workspace/src/server/effect/route.ts`: Hono Adapter that runs Effect programs and maps typed outcomes to JSON responses.

## Workspace Consumers

- `apps/workspace/src/server/app/app.ts`: Hono app boundary; mounts request-safety middleware before auth/Sentry route instrumentation.
- `apps/workspace/src/server/security/request-safety.ts`: Hono-facing request safety Module for disabled-by-default origin/CORS/host/referrer/header policy composition and organization request context wiring.
- `apps/workspace/src/server/domains/organization/handlers/workspace-read-surface.ts`: Workspace organization read Module for organization id parsing, list query parsing, bounded limits, and read response dispatch.
- `apps/workspace/src/server/domains/organization/handlers/workspace-read.ts`: read route facade for projects, properties, clients, calendar, activity, and dashboard resources.
- `apps/workspace/src/domains/resources/workspace-resource-request.ts`: client-side Workspace resource request Module for organization read paths, paged/indexed queries, JSON error mapping, and mutation calls.
- `apps/workspace/src/domains/activity/activity-view-model.ts`: Activity view-model Module for audit category tones, action labels, actor compaction, and relative-time projection.
- `apps/workspace/src/domains/dashboard/dashboard-view-model.ts`: Dashboard view-model Module for week range calculation, desk event projection, latest client/project ordering, and compact schedule labels.
- `apps/workspace/src/domains/calendar/calendar-view-model.ts`: Calendar view-model Module for visible ranges, date labels, date keys, event ordering, slot event projection, scheduling vocabulary, location serialization, status tones, navigation, form date/time options, client-scoped task projection, and picker option filtering.
- `apps/workspace/src/domains/clients/pipeline-command.ts`: Client pipeline command Module for form projection and indexed cache patch/remove behavior.
- `apps/workspace/src/domains/clients/client-view-model.ts`: Client view-model Module for pipeline vocabulary, client status tones, pipeline stage indexing, form projection, task payload parsing/update projection, client search/stage projections, visible calendar events, unit picker filtering, and activity task row projection.
- `apps/workspace/src/domains/clients/api/client-tasks.ts`: browser Client task API wrapper for task reads, options, and create/update/delete mutations.
- `apps/workspace/src/domains/properties/property-view-model.ts`: Property view-model Module for filters, property type vocabulary, status tones, price/file formatting, upload preview URLs, property search matching, project picker search, media/doc splitting, gallery preview counts, and linked-client candidate projection.
- `apps/workspace/src/domains/projects/project-view-model.ts`: Project view-model Module for filters, calendar/date helpers, project date picker labels/navigation, project search, form defaults, offering mix commands, price row commands, status tones, upload preview URLs, detail metrics, movement bar widths, document media selection, location labels, and compact detail rows.
- `apps/workspace/src/domains/agents/conversation-runtime.ts`: Agent conversation runtime Module for attachment upload normalization, durable/transient message reconciliation, thread URL composition, and message direction.
- `apps/workspace/src/server/domains/partnerApps/handlers/admin-partner-apps.ts`: first Workspace admin partner handlers migrated away from repeated `try/catch`.
- `apps/workspace/src/server/domains/partnerApps/handlers/partner-apps.ts`: first Workspace partner catalog/grant handlers migrated to the route Adapter.
- `apps/workspace/src/server/cache/*`: existing cache readiness seam that now points to the shared cache Interface.

## Partners Consumers

- `apps/partners/app/api/partner-auth-rate-limit.ts`: app-local Next Adapter for shared HTTP rate-limit behavior.
- `apps/partners/app/api/partner-signup/route.ts`: uses the Partners auth rate-limit Adapter.
- `apps/partners/app/api/partner-signin/route.ts`: uses the Partners auth rate-limit Adapter.
- `apps/partners/rate-limits/memory.ts`: legacy ad hoc limiter, removed once callers use the shared Module.

## Tests

- `packages/platform-core/src/effect-api.test.ts`: typed errors, cache, and rate-limit behavior.
- `apps/workspace/src/server/effect/route.test.ts`: Hono Adapter response mapping and rate-limit headers.
