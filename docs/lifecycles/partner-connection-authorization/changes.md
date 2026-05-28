# Changes

## 2026-05-28 Partners App Catalog Projection Depth

- Added a Partners app catalog projection Module for portal summaries, Admin Review records, and published catalog records.
- Concentrated Partner app status mapping, client type projection, icon/logo fallback, date conversion, description defaults, and redirect/scope normalization in one Module.
- Kept Partners as the app catalog source of truth while reducing projection knowledge in developer, admin, and platform repositories.

## 2026-05-28 Partners Service Token Gate Depth

- Added a Partners service-token gate Module for Admin Review and Workspace platform catalog route authentication.
- Preserved existing bearer token, legacy admin/platform header, and platform token environment compatibility.
- Kept Admin Review and platform catalog route ownership unchanged while removing duplicated token parsing from the repository Modules.

## 2026-05-28 Partners OAuth Runtime Sync Status Depth

- Deepened the Partners-to-Workspace OAuth runtime projection Module so Admin Review uses the same validated Workspace publisher as other runtime-sync callers.
- Changed Admin Review to persist `workspaceSyncStatus: "pending"` during the review mutation, then update to `"synced"` only after Workspace accepts the projection response.
- Persisted `"failed"` plus the publish error when Workspace runtime projection publishing fails, instead of reporting a synced runtime before response validation.
- Kept Partners as the app catalog/review source of truth and Workspace as the OAuth runtime projection owner.

## 2026-05-28 Integrations View-Model Expiry Depth

- Deepened the Integrations view-model Module with connection expiry label projection used by catalog/detail screens.
- Preserved Partner connection status, fallback labels, app detail routes, and catalog behavior while removing date formatting from the screen.

## 2026-05-28 Workspace Integrations Runtime Depth

- Added a client-side integrations runtime Module so Workspace web-app screens no longer own partner catalog and organization connection HTTP details inline.
- Routed partner-connection organization route construction through the shared organization request Module.
- Routed OAuth consent partner app catalog lookup through the same Integrations runtime Module.
- Preserved public `/api/v1/integrations/partner-apps` and organization partner-connection route usage, response fallbacks, mutation methods, and visible UI behavior.
- Added focused tests for catalog/connection route construction, empty payload fallback, mutation methods, encoding, shared filter options, and existing error messages.
- Routed OAuth consent grant creation through the same integrations runtime Module while preserving requested resource scope storage and Better Auth consent ownership.

## 2026-05-28 Partners Hono Runtime Depth

- Added a Partners Hono runtime Module for service-token route execution and list/query parsing across admin and platform catalog routes.
- Kept Partners public/admin/platform route URLs, service-token semantics, response shapes, and source-of-truth ownership unchanged.

## 2026-05-28 Webhook Delivery Deepening

- Kept `partnerApps.webhooks` Convex function names stable while moving webhook URL safety, signing-secret crypto, inbound persistence, outbound enqueueing, delivery target lookup, and retry state into internal Modules.
- Preserved inbound idempotency, encrypted payload storage, client upsert audit behavior, outbound partner delivery enqueueing, HMAC signing, and retry timing.
- Added focused Partner webhook Module tests for endpoint URL rejection, signature generation, endpoint presentation, inbound duplicate detection, and retry scheduling.

## 2026-05-28 Partner Resource Access Deepening

- Added a Hono-facing `partner-resource-access` Module so partner API handlers use one access Interface for OAuth bearer tokens and organization API keys.
- Kept public partner resource routes, response shapes, and OAuth/API-key error behavior stable while removing token-kind branching from handlers.
- Added `convex/partnerResourceGateway.ts` as the shared resource gateway behind stable `partnerApps.resources` and `organizationApiKeys` Convex wrappers.
- Concentrated bridge-token assertion, resource read shape, client write patching, actor-specific audit, and partner-only outbound webhook enqueueing in the shared gateway.
- Added focused tests for OAuth/API-key access, handler dependency shape, bridge-token rejection, read limits, soft-delete filtering, and actor-specific client writes.

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
