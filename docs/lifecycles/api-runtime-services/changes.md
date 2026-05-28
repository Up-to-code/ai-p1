# Changes

## 2026-05-28 Project Date Picker Depth

- Deepened the Project view-model Module with project date picker display labels, weekday labels, and month navigation.
- Preserved Project form date picker display, month stepping, ISO output, and validation behavior while removing date presentation math from the screen.

## 2026-05-28 Calendar Date Label Depth

- Deepened the Calendar view-model Module with short month, day/month, long day, long day/year, and ISO option label helpers.
- Preserved Calendar labels and scheduling option display while removing repeated date formatting options from the screen.

## 2026-05-28 Project Movement Presentation Depth

- Deepened the Project view-model Module with sales movement bar width projection.
- Preserved Project sales/overview bar minimum width behavior and live-unit zero fallback while removing duplicate width math from the screen.

## 2026-05-28 Client Activity View-Model Depth

- Deepened the Client view-model Module with activity task row projection for linked-unit lookup, due-date fallback formatting, done-state, and status tone.
- Added Client task update payload projection so visibility/status handlers depend on one tested Interface instead of repeating task field copies.
- Added Client pipeline stage index projection for the detail progress rail.
- Preserved Client detail task rendering, translation keys, update/delete payloads, and activity tab behavior while removing render-local task presentation branching.

## 2026-05-28 Activity View-Model Depth

- Added the Activity view-model Module so the Activity screen no longer owns audit category tone mapping, action label projection, actor compaction, or relative-time formatting inline.
- Preserved Activity indexed resource calls, table columns, translation keys, loading states, and rendered response shapes.

## 2026-05-28 Calendar Event Projection Depth

- Deepened the Calendar view-model Module with immutable event ordering and half-hour slot projection.
- Preserved Calendar month/week/day rendering, dialog ordering, event chip behavior, and route/query behavior while removing render-local event filtering and in-place sorting.

## 2026-05-28 Project Form Command Depth

- Deepened the Project view-model Module with offering mix and project price row command helpers.
- Preserved Project create/edit form values, validation triggers, row fallback behavior, and submitted payload shape while removing list mutation logic from the screen.

## 2026-05-28 Project View-Model Form Depth

- Deepened `domains/projects/project-view-model.ts` so Projects screen search matching and Project form default/reset projection live behind one view-model Interface.
- Preserved Project list filtering, create/edit default values, invalid legacy type handling, price row behavior, and form reset behavior.
- Deepened `domains/properties/property-view-model.ts` so the Property form project picker uses the same tested view-model surface for normalized project option search.

## 2026-05-28 Workspace Resource Request Depth

- Moved Activity and Dashboard read-heavy screens onto the shared Workspace resource request Module.
- Added the Dashboard view-model Module so the Dashboard screen no longer owns week range calculation, desk event projection, latest client/project ordering, or compact schedule labels inline.
- Moved Client task option reads onto the same Workspace resource request Module.
- Preserved existing `/api/v1/organizations/:organizationId/read/...` routes, query keys, loading states, and response handling while concentrating frontend read URL construction in one Seam.

## 2026-05-28 Workspace Client View-Model Depth

- Added and deepened the Client view-model Module so the Clients screen no longer owns pipeline vocabulary, client status tone mapping, form projection, task payload parsing, client search/stage projection, visible calendar filtering, or unit picker filtering.
- Deepened the Calendar view-model Module with scheduling vocabulary, event tone mapping, event type classes, location serialization, time labels, generated schedule titles, form date/time options, client-scoped task projection, and picker option filtering.
- Added Property and Project view-model Modules so large Workspace screens depend on small internal Interfaces for filter vocabularies, status tone mapping, date/price helpers, property search/media/client-link projection, project detail metrics, media document selection, and upload preview URL lifecycle.
- Added the Agent conversation runtime Module so Dashboard Chat no longer owns attachment upload normalization, durable/transient message reconciliation, or thread URL composition.
- Kept external HTTP routes, Convex calls, screen URLs, query parameters, and response shapes unchanged.

## 2026-05-28 Client Task Request Depth

- Moved browser Client task create/update/delete mutations onto the shared organization request Module for route segment encoding, JSON request construction, and error fallback behavior.
- Preserved Client task exported function names, payload shape, mutation methods, and existing task query hooks.
- Added focused tests for encoded task mutation routes and fallback errors.

## 2026-05-28 Client Runtime Surface Depth

- Added a client-side Workspace resource request Module used by Projects, Properties, Clients, and Calendar API Modules for organization read paths, paged/indexed queries, JSON error mapping, and mutations.
- Added Calendar view-model and Client pipeline command Modules so date/range behavior and pipeline cache patches have narrower testable Interfaces.

## 2026-05-28 Workspace Runtime Surface Deepening

- Added the Hono-facing `security/request-safety` Module and mounted it at the app boundary with disabled-by-default policy composition so accepted requests and headers remain unchanged.
- Routed organization mobile request context through the request-safety Module while preserving the existing `x-request-id` contract.
- Added `workspace-read-surface` so organization read handlers depend on one Module for organization id parsing, list query parsing, bounded limits, timeout/error response mapping, and read dispatch.
- Added focused tests for request-safety defaults, organization request context composition, and workspace read surface parsing/response behavior.

## 2026-05-16 Effect Runtime First Pass

- Created lifecycle docs for incremental Effect API runtime, DRY cache, and HTTP rate limiting.
- Planned the first implementation slice around a shared `platform-core` runtime Module and a Workspace Hono Adapter.
- Kept Hono and Next route entrypoints unchanged to avoid a broad router rewrite.
- Added shared typed API errors, Effect cache service, and in-memory HTTP rate-limit service in `@qentrah/platform-core`.
- Added the Workspace Hono `runEffectRoute` Adapter and migrated partner app/admin handlers to use it.
- Replaced Partners signup/signin local rate limiter with the shared rate-limit Interface and removed the app-local limiter.
- Re-exported cache keys/policies/read-through/invalidation from the Workspace cache seam.
- Ran focused platform, Workspace, Partners, and Admin tests/typechecks successfully.
- Split the `@qentrah/platform-core/effect-api` Implementation into error, cache, and rate-limit Modules while keeping the same public Interface.
- Added `routeSync` for Workspace Hono guard code and a Partners auth rate-limit Adapter to remove repeated header/429 ceremony.
