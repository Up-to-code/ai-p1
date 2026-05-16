# Changes

## 2026-05-16 Partners Published Catalog Cache

- Added short-lived Partners repository caching for the service-token protected published catalog endpoints used by Workspace integrations.
- Added cache-control headers for published app list/detail responses.
- Added tests proving repeated published catalog and published app lookups do not repeatedly hit Prisma for the same cache key.
- Left verification and source-of-truth ownership unchanged: Partners remains the app catalog/review owner, Workspace remains organization grant owner.

## 2026-05-16 Architecture Deepening Pass

- Deepened the OAuth runtime projection Module by moving the shared projection contract, status mapping, and runtime scope normalization into `@qentrah/partner-workspace-sync`.
- Updated Partners Adapters to build the shared projection payload instead of hand-writing Workspace runtime-sync JSON.
- Updated Workspace runtime sync to consume the explicit projection contract and removed runtime fallback reads for old OAuth client field names from the sync path.
- Introduced `authorizePartnerResourceRequest` as the named partner resource access Interface and made token grant validation use canonical partner scopes.
- Added an integrations view-model Module for catalog/grant merging, status tone, connection actions, and detail lookup.

## 2026-05-16 Emergency Data Compatibility Unblock

- Identified a legacy `organizationPartnerConnections` document missing canonical `partnersAppId` and `partnersClientId` fields.
- Planned a targeted data patch using the existing legacy `partnerAppId` and `oauthClientId` values so the strict Convex schema can validate and deploy current functions.
- Updated the migration patch to unset old `partnerAppId` and `oauthClientId` fields after canonical fields are written, because Convex strict object validation rejects extra fields.
- Ran the compatibility backfill against the dev deployment; two legacy partner connection records were patched and preview now reports `needsMigration: 0`.

## 2026-05-16

- Created lifecycle record for shared partner authorization core extraction.
- Planned hard cutover from legacy connection fields to `partnersAppId` and `partnersClientId`.
- Documented Better Auth as OAuth protocol owner and Workspace Convex as organization grant owner.
- Added `@qentrah/partner-auth-core` for partner scopes, claims, resource audience, and OAuth provider helper constants.
- Moved Workspace partner authorization imports to the shared core package and removed the app-local scope module.
- Fixed consent grant broadening so Workspace stores requested scopes rather than the partner app maximum allowed scopes.
- Tightened partner token parsing to canonical `organization_id` plus `azp` or `client_id`, rejecting old organization claim aliases.
- Made `organizationPartnerConnections.partnersAppId` and `partnersClientId` required and added a Convex migration helper for old documents.

## 2026-05-16 Cleanup Pass

- Kept `@qentrah/partner-auth-core` as the shared source for partner scopes, claims, and resource audience, and added a package README for the review boundary.
- Tightened Workspace Convex partner connection return validators so connection/list/update/read paths no longer use broad `v.any()` returns.
- Removed Workspace-owned partner app creation/review routes, schemas, and throw-only service functions after confirming Partners/Admin owns app catalog and review behavior.
- Changed old Workspace admin partner review endpoints into explicit `410` transition responses behind the existing admin token/origin boundary.
- Confirmed legacy `partnerAppId` and `oauthClientId` runtime compatibility references are isolated to `convex/partnerApps/migrations.ts`.

## 2026-05-16 Repo Stabilization Cleanup

- Removed the unused Admin-to-Workspace partner review bridge because Admin now reviews partner apps through Partners APIs.
- Removed Workspace transition list/review endpoints for partner app review; Workspace keeps only OAuth runtime projection sync under `/api/v1/admin/oauth-client-runtime-sync`.
- Removed origin validation helpers that only served the deleted browser-facing transition endpoints.

## 2026-05-16 Source-Of-Truth Cleanup

- Locked the source-of-truth split: Partners owns app catalog/review, Better Auth owns OAuth protocol/client runtime, and Workspace owns organization grants.
- Planned Workspace admin sync as an OAuth runtime projection only, not partner app registration or review storage.
- Added a Mermaid flow chart for creation, review, catalog fetch, consent, grant storage, and partner API enforcement.
- Renamed the Workspace admin sync route to `/api/v1/admin/oauth-client-runtime-sync`.
- Removed the Partners review callback route and `PARTNERS_REVIEW_CALLBACK_TOKEN` requirement because review decisions are saved in Partners directly.
- Updated Partner portal copy so pending review and runtime sync no longer imply Workspace owns the review queue.
- Added local env wiring so Admin and Workspace call Partners as the app-catalog source of truth during development.

## 2026-05-16 Architecture Skill Setup

- Installed project-local `improve-codebase-architecture` skill from `mattpocock/skills`.
- Added Qentrah `CONTEXT.md`, architecture language, ADRs, and an RFC of deepening candidates.
- Prioritized OAuth runtime projection and partner resource access as the first architecture cleanup Modules for this lifecycle.
