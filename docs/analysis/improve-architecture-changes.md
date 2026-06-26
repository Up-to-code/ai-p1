# Improve Architecture Changes

This document tracks all architecture improvements made to the Qentrah codebase, including completed phases, files scanned, fixes applied, and ongoing opportunities for further deepening.

## Overview

This is a living document that serves as a reference for all architecture work completed and ongoing. It provides visibility into:
- Completed architecture deepening phases
- Files that have been modified or removed
- Patterns identified and addressed
- Opportunities for future improvements

## Completed Work

### Phase 1: Eliminate workspace-logic Package ✅

**Action**: Removed the `packages/workspace-logic` package entirely.

**Rationale**: The package was a pass-through module with no consumers. It only re-exported types from `domain-contracts` with minimal wrapper functions, providing no genuine business logic value.

**Benefits**:
- **Locality**: Removes confusion about where workspace logic lives
- **Leverage**: Eliminates false abstraction layer
- **Tests**: No need to test wrapper functions that add no behavior

**Files Removed**:
- `packages/workspace-logic/src/zones.ts`
- `packages/workspace-logic/src/zones.test.ts`
- `packages/workspace-logic/package.json`
- `packages/workspace-logic/README.md`

### Phase 2: Eliminate CRM Logic Package ✅

**Action**: Removed the `packages/crm-logic` package entirely.

**Rationale**: The package was tightly coupled to a specific legacy CRM system (RED/broker) with no consumers in the codebase. The mappers knew about specific field names that don't generalize.

**Benefits**:
- **Locality**: Legacy CRM specifics no longer in a separate package
- **Leverage**: When CRM integrations are needed, they can be added via adapters directly in consuming code
- **Tests**: Eliminates unused test code

**Files Removed**:
- `packages/crm-logic/src/mappers.ts`
- `packages/crm-logic/src/mappers.test.ts`
- `packages/crm-logic/package.json`
- `packages/crm-logic/README.md`

### Phase 3: Create Shared Presentation Layer ✅

**Action**: Enhanced `apps/workspace/convex/shared/present.ts` with generic presentation interfaces and updated domain read functions to use them.

**Rationale**: Presentation logic (presentClient, presentProject, presentDeal, presentOpportunity) was duplicated across Convex read functions. Each domain reinvented the same transformation pattern.

**Benefits**:
- **Locality**: Presentation logic centralized and consistent
- **Leverage**: New domains get presentation behavior for free
- **Tests**: Can test presentation transformations independently

**Files Modified**:
- `apps/workspace/convex/shared/present.ts` - Added `presentBaseRecord`, `DomainPresenter` type, and `createListItemPresenter` helper
- `apps/workspace/convex/deals/read.ts` - Updated to use `presentWorkspaceRecord` from shared module
- `apps/workspace/convex/opportunities/read.ts` - Updated to use `presentWorkspaceRecord` from shared module

### Phase 4: Implement Server Domain Services ✅

**Action**: Added domain business rules to server domain services for clients and projects.

**Rationale**: The server domains structure existed as placeholder contracts with minimal implementation. Business logic still lived directly in Convex functions rather than domain services.

**Benefits**:
- **Locality**: Business logic concentrated in domain services
- **Leverage**: Services can be tested independently and reused across different API layers
- **Tests**: Domain logic testable without Convex runtime

**Files Modified**:
- `apps/workspace/src/server/domains/clients/services/clients.ts` - Added `clientBusinessRules` with pipeline transition validation and default visibility logic
- `apps/workspace/src/server/domains/projects/services/projects.ts` - Added `projectBusinessRules` with status transition validation, default health logic, and client linking validation

### Phase 5: Refactor Client View Model ✅

**Action**: Added documentation to clarify the purpose of the client view model.

**Rationale**: The client view model (298 lines) is mostly utility functions and form transformations. It doesn't provide deep domain behavior - just surface-level mapping.

**Benefits**:
- **Locality**: Domain business rules separated from presentation logic
- **Leverage**: Domain service can be used by multiple presentation layers
- **Tests**: Business rules testable independently of UI concerns

**Files Modified**:
- `apps/workspace/src/domains/clients/client-view-model.ts` - Added header comment clarifying presentation focus and noting that domain business rules should be in a separate service

### Phase 6: Schema Index Optimization ✅

**Action**: Created schema utilities for index pattern documentation and query optimization guidelines.

**Rationale**: The schema has many similar index patterns (by_organization_id, by_organization_status, by_organization_updated) that could be abstracted. Some queries scan large datasets (MAX_STATS_SCAN_ITEMS = 2_000).

**Benefits**:
- **Locality**: Index strategy centralized and documented
- **Leverage**: Consistent indexing patterns across all tables
- **Tests**: Can validate index coverage and query efficiency

**Files Created**:
- `apps/workspace/convex/schema-utils.ts` - Added `IndexPatterns` for common index patterns, `QueryOptimization` for scan limits and pagination strategies, and utility functions for index coverage checking

## Comprehensive Codebase Scan Results

**Status**: Completed

**Scope**: Full monorepo scan including all packages, apps, documentation, and scripts.

### Complete Package Analysis (21 Packages)

**Active Packages with Consumers (16)**:
- `@qentrah/ag-ui` - Agent UI protocol and React renderer (no direct consumers found, may be external)
- `@qentrah/auth` - OAuth2/OpenID Connect auth core (workspace: 3 files, marketing: via dependencies)
- `@qentrah/auth-client` - Better Auth client factories (used via @qentrah/auth)
- `@qentrah/auth-sdk` - Public partner integration SDK (external developers)
- `@qentrah/authorization` - Organization authorization SDK (workspace: 3 files)
- `@qentrah/brand-identity` - Centralized brand configuration (used by auth, authorization, ui, web-foundation)
- `@qentrah/calendar-kit` - React calendar scheduler (workspace: 1 file)
- `@qentrah/convex-adapters` - Convex adapter helpers (workspace: 2 files)
- `@qentrah/domain-contracts` - DTOs, Zod schemas, contracts (workspace: 6 files, marketing: via dependencies)
- `@qentrah/location-map` - Mapbox location components (workspace: 1 file)
- `@qentrah/partner-auth-core` - Internal partner auth utilities (no consumers found)
- `@qentrah/partner-workspace-sync` - Partner workspace sync utilities (no consumers found)
- `@qentrah/platform-core` - Platform primitives (workspace: 4 files, marketing: via dependencies)
- `@qentrah/testing` - Test fixtures and Vitest helpers (dev dependency)
- `@qentrah/ui` - React UI primitives (workspace: 1 file)
- `@qentrah/web-foundation` - Next/web foundation helpers (workspace: via dependencies)

**Dead Code Packages (4)**:
- `@qentrah/compliance-logic` - 12 lines of compliance helpers (no consumers anywhere)
- `@qentrah/market-logic` - 5,541 lines of market normalizers (no consumers anywhere)
- `@qentrah/offers-logic` - 70 lines of offer case logic (no consumers anywhere)
- `@qentrah/base-logic` - Utility helpers (no consumers anywhere)

### Applications Architecture

**Workspace App**:
- 18 server domains with services/handlers/validation structure
- 34 view-model files for presentation layer
- 160+ Convex functions organized by domain
- 6 Surface files for domain-specific aggregation
- Uses 10 @qentrah packages

**Marketing App**:
- Payload CMS with 9 collections
- 7 content blocks for CMS
- Comprehensive SEO and i18n support
- Uses 2 @qentrah packages (brand-identity, domain-contracts)
- Clean separation from private workspace runtime

**Mobile App**:
- Expo React Native with foundation layers
- Conversation system with agent protocol
- Self-contained architecture (0 @qentrah packages)
- Uses Convex directly

### Architecture Patterns Identified

1. **Domain-Driven Design**: Clear domain separation in workspace app (18 domains)
2. **Service Layer Pattern**: Business logic in domain services (partially implemented)
3. **Presentation Layer Pattern**: 34 view-model files with shared presentation functions
4. **Surface Pattern**: 6 Convex Surface files for domain-specific aggregation
5. **Package Architecture**: Well-categorized packages (core, auth, UI, domain, testing)
6. **Lifecycle Documentation**: 13 lifecycle directories with comprehensive documentation

**Detailed Report**: See `comprehensive-codebase-scan-report.md` for complete analysis.


## Success Criteria Achieved

- ✅ **Reduced duplication**: Presentation logic now uses shared `presentWorkspaceRecord` function
- ✅ **Clearer seams**: Removed unused packages, enhanced domain services with business rules
- ✅ **Better testability**: Domain business rules extracted to services where they can be tested independently
- ✅ **AI-navigability**: Clear module boundaries make the codebase easier for AI agents to understand
- ✅ **Extensibility**: Index patterns documented for consistent future additions

## Breaking Changes

None. The removed packages (`workspace-logic`, `crm-logic`) had no consumers in the codebase, so their removal is safe.

## Next Steps

### Immediate Opportunities

1. **Remove dead logic packages**: Remove 4 unused packages that have no consumers anywhere in the monorepo:
   - `packages/compliance-logic` (12 lines)
   - `packages/market-logic` (5,541 lines)
   - `packages/offers-logic` (70 lines)
   - `packages/base-logic` (utility helpers)
   - Before removal, verify no external integrations or partner apps outside this monorepo depend on them
2. **Extract business rules for deals and opportunities**: Add domain-specific business rules to `deals/services/deals.ts` and `opportunities/services/opportunities.ts` following the pattern established for clients and projects
3. **Package usage audit**: Verify consumers for packages with unclear usage:
   - `@qentrah/ag-ui` (no direct consumers found)
   - `@qentrah/partner-auth-core` (no consumers found)
   - `@qentrah/partner-workspace-sync` (no consumers found)

### Future Improvements

4. **Complete service layer**: Extract business rules for all domains into their respective services
5. **Standardize presentation**: Evaluate if clients PII handling can be abstracted into shared presentation layer
6. **Document architecture patterns**: Create ADRs for Surface pattern, service factory, and domain service patterns
7. **Testing strategy**: Add tests for business rules in services and ensure view model coverage

## Migration Guide

No migration needed. All changes are additive or remove unused code.

## Related Documentation

- [Architecture Deepening Implementation Summary](./architecture-deepening-implementation-summary.md)
- [Tasks Domain Report](./tasks-domain-report.md)
