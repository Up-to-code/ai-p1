# Improve Codebase Architecture RFC

Date: 2026-05-16

Method: project-local `improve-codebase-architecture` skill, Qentrah `CONTEXT.md`, existing lifecycle docs, and ADRs.

## Summary

This RFC records deepening opportunities. It does not authorize a broad rewrite. Each candidate should become a small follow-up change with lifecycle docs updated before code edits.

## Candidate 1: OAuth Runtime Sync Module

Files:
- `apps/partners/server/adminPartnerApps.ts`
- `apps/partners/server/qentrahWorkspace.ts`
- `apps/workspace/src/server/domains/partnerApps/services/admin-partner-apps.ts`
- `apps/workspace/convex/partnerApps/oauthClients.ts`

Problem:
- The OAuth runtime sync Module is still shallow. Callers know too much about Workspace URLs, service-token headers, status mapping, and Better Auth projection shape.
- Deletion test: deleting the current helpers would spread token loading, endpoint paths, status conversion, and error wording back into Admin review and Partners code.

Solution:
- Create one deeper Module named **OAuth runtime projection** with a small Interface: `syncOAuthRuntimeProjection(app)` and `projectRuntimeStatus(status)`.
- Keep Adapters app-local: Partners HTTP Adapter sends projection; Workspace Better Auth Adapter applies projection.
- Hide service tokens, route paths, status mapping, and response parsing inside the Module.

Benefits:
- More locality: runtime sync failures live in one Module.
- More leverage: Admin review can approve an app without knowing Workspace runtime details.
- Better tests: test the Interface once with approved/rejected/suspended apps instead of checking every caller's fetch shape.

Lifecycle:
- `docs/lifecycles/partner-connection-authorization/`

## Candidate 2: Partner Resource Access Module

Files:
- `apps/workspace/src/server/domains/partnerApps/services/access-token.ts`
- `apps/workspace/src/server/domains/partnerApps/services/resources.ts`
- `apps/workspace/convex/partnerApps/apps.ts`
- `apps/workspace/convex/partnerApps/resources.ts`

Problem:
- Token parsing, claim validation, grant lookup, scope checks, and resource dispatch are split across several Modules. The Interface callers see is larger than it should be: bearer headers, claims, organization id, resource, action, Convex query result shape, and failure modes.
- Deletion test: deleting one helper mostly moves the same complexity to handlers instead of removing it.

Solution:
- Create a deeper **Partner resource access** Module with an Interface like `authorizePartnerResourceRequest(request, resource, action)` returning an authorized context.
- Keep Better Auth JWT verification, canonical claim parsing, grant validation, and scope denial inside the Implementation.
- Keep Convex and HTTP Adapters separate behind that Interface.

Benefits:
- More locality: security bugs in partner access concentrate in one test surface.
- More leverage: resource handlers receive an authorized context instead of reconstructing auth rules.
- Better tests: one authorization test matrix can cover missing client id, wrong organization, expired grant, denied scope, and unpublished app verification.

Lifecycle:
- `docs/lifecycles/partner-connection-authorization/`

## Candidate 3: Data Security Backfill Module

Files:
- `apps/workspace/convex/security/backfill.ts`
- `apps/workspace/convex/security/organizationData.ts`
- `apps/workspace/convex/security/clientPii.ts`
- `apps/workspace/convex/schema.ts`

Problem:
- The backfill Module has a strong execution design, but its Interface still exposes target names, patch shapes, cursor details, and per-table behavior in one large file.
- Deletion test: deleting the helper functions would scatter encryption/redaction decisions across every target branch.

Solution:
- Split target-specific behavior into Backfill Target Adapters behind a common Interface: `read`, `protect`, `patch`, `isAlreadyProtected`.
- Keep the job scheduler, cursor state, and failure recording as the deep orchestration Module.

Benefits:
- More locality: each target owns its encryption/redaction rules.
- More leverage: adding a new encrypted target does not require editing the orchestration logic.
- Better tests: each Adapter can be tested with small fixtures, while scheduler tests focus on resumability and retry behavior.

Lifecycle:
- `docs/lifecycles/data-security-and-retention/`

## Candidate 4: Workspace Domain Screen Modules

Files:
- `apps/workspace/src/domains/organization/components/organization-screens.tsx`
- `apps/workspace/src/domains/calendar/components/calendar-screen.tsx`
- `apps/workspace/src/domains/properties/components/properties-screens.tsx`
- `apps/workspace/src/domains/clients/components/clients-screens.tsx`

Problem:
- Several screen Modules are large enough that UI state, data fetching, mutation orchestration, validation, and rendering live in one file. Some extractions would be shallow, but the current files hide too little behind their Interfaces.

Solution:
- Do not split by visual sections only. Extract deep Modules around workflows: form state, mutation orchestration, table/query state, and detail panels.
- Only extract when the new Interface hides meaningful state or behavior.

Benefits:
- More locality: workflow bugs move out of giant render files.
- More leverage: tests can exercise workflow Modules without rendering full pages.
- Better AI navigability: future agents can inspect one workflow Module instead of scanning thousands of lines.

Lifecycle:
- Create lifecycle folders per workflow before refactoring, for example `calendar-event-management` or `client-pipeline-management`.

## Candidate 5: Convex Adapter Type-Seam Cleanup

Files:
- `packages/convex-adapters/src/repository.ts`
- `apps/workspace/src/server/domains/*/services/*.ts`
- `apps/workspace/convex/*`

Problem:
- Many server-domain services use `as never` to cross Convex function references. The Seam exists, but the Interface leaks generated Convex typing limitations into callers.

Solution:
- Deepen the Convex repository Module so callers pass domain ids and payloads through a typed Interface without repeated casts.
- Keep generated Convex references behind Adapters where needed.

Benefits:
- More locality: casting and generated-reference quirks live in one Module.
- More leverage: services become simpler and safer to review.
- Better tests: repository Adapters can be faked without re-creating Convex generated types in every service test.

Lifecycle:
- Choose lifecycle based on the first domain touched.

## First Three Refactors

1. OAuth runtime projection Module.
2. Partner resource access Module.
3. Data security backfill target Adapter Module.

Do not start with large screen extraction unless a product change is already touching that workflow.

## 2026-05-16 Architecture Deepening Implementation

Status: first implementation pass completed for all five candidates.

- **OAuth runtime projection Module**: added shared projection schemas, response schema, status mapping, and runtime scope normalization in `@qentrah/partner-workspace-sync`; Partners now builds projection payloads through the shared Interface; Workspace consumes the explicit projection contract.
- **Partner resource access Module**: added the named `authorizePartnerResourceRequest` Interface and made grant validation use canonical partner scopes from token claims.
- **Data security backfill Module**: split per-target table/id/protection/patch behavior into Backfill Target Adapters while keeping scheduler/cursor/retry behavior in the job runner.
- **Convex Adapter type Seam**: added `createConvexHttpCalls` and converted touched Workspace partner/security services to typed Convex HTTP calls.
- **Workspace integrations screen Module**: added an integrations view-model Module for catalog/grant merging, effective status, status tone, actions, and detail lookup.

Checks:
- `npm --workspace @qentrah/partner-workspace-sync test`
- `npm --workspace @qentrah/partner-workspace-sync run typecheck`
- `npm --workspace @qentrah/convex-adapters test`
- `npm --workspace @qentrah/convex-adapters run typecheck`
- `npm --workspace @qentrah/workspace test -- src/server/domains/partnerApps convex/security/backfillTargets.test.ts src/domains/integrations/store/integrations.view-model.test.ts`
- `npm --workspace @qentrah/workspace run typecheck`
- `npm --workspace @qentrah/workspace run codegen:convex`
- `npm --workspace @qentrah/partners test`
- `npm --workspace @qentrah/partners run typecheck`
- `npm --workspace @qentrah/admin-review test`
- `npm --workspace @qentrah/admin-review run typecheck`

Remaining risks:
- Backfill cursor/resume behavior still needs a full Convex scheduled-job harness.
- Large Workspace screens beyond integrations remain future candidates; no broad UI rewrite was attempted.
- Migration-only legacy partner connection references remain intentionally isolated.
