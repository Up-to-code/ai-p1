# Comprehensive Codebase Architecture Scan Report

**Scan Date**: June 26, 2026
**Repository**: Up-to-code/anan-0.1.2
**Purpose**: Complete architectural analysis of Qentrah monorepo

## Executive Summary

This report provides a comprehensive scan of the entire Qentrah codebase, documenting all packages, applications, architectural patterns, and improvement opportunities identified during the analysis.

## Codebase Structure Overview

### Root Level
- **Monorepo Type**: npm workspaces with Bun
- **Package Manager**: Bun (bun.lock)
- **Total Packages**: 21 packages in packages/ directory
- **Total Apps**: 3 apps (workspace, marketing, mobile)
- **Total Documentation**: 43 markdown files across docs/
- **Total Scripts**: 5 build/utility scripts

## Packages Directory Analysis (21 Packages)

### Active Packages with Consumers

#### 1. **@qentrah/ag-ui** (Agent UI)
- **Purpose**: Reusable AG UI package for rendering structured agent turns as ready-made UI cards
- **Exports**: Protocol types, schemas, React renderer with registry overrides
- **Consumers**: None found in apps (may be used in partner apps or external)
- **Status**: ✅ Well-structured with clear protocol and React integration

#### 2. **@qentrah/auth** (Authentication Core)
- **Purpose**: Shared OAuth2/OpenID Connect auth, scope, and authorization helpers
- **Exports**: client, react, resource-server, scopes, server, oauth-provider
- **Consumers**: workspace (3 files), marketing (via dependencies)
- **Status**: ✅ Core auth package with proper separation of concerns

#### 3. **@qentrah/auth-client** (Auth Client)
- **Purpose**: Shared browser Better Auth client factories
- **Exports**: web, admin, forms, external-apps
- **Consumers**: Not directly found (likely used via @qentrah/auth)
- **Status**: ✅ Focused client-side auth utilities

#### 4. **@qentrah/auth-sdk** (Partner SDK)
- **Purpose**: Batteries-included Qentrah partner integration SDK for developers
- **Exports**: errors, partner (browser, next, service-app, harness, webhooks), qentrah-auth.js
- **Consumers**: External partner developers (public package)
- **Status**: ✅ Public SDK for external integrations

#### 5. **@qentrah/authorization** (Authorization)
- **Purpose**: Qentrah organization authorization SDK for external applications
- **Exports**: react
- **Consumers**: workspace (3 files)
- **Status**: ✅ Authorization layer for external apps

#### 6. **@qentrah/brand-identity** (Brand Identity)
- **Purpose**: Shared brand identity configuration
- **Exports**: Brand constants (slug, packageScope, envPrefix)
- **Consumers**: auth, authorization, ui, web-foundation (via build dependencies)
- **Status**: ✅ Centralized brand configuration

#### 7. **@qentrah/calendar-kit** (Calendar Component)
- **Purpose**: Production-ready React scheduler with Month, Week, and Day views
- **Exports**: Main component, styles
- **Consumers**: workspace (1 file in calendar domain)
- **Status**: ✅ Specialized UI component

#### 8. **@qentrah/convex-adapters** (Convex Adapters)
- **Purpose**: Shared Convex adapter helpers for Next.js repository layers
- **Exports**: api, repository
- **Consumers**: workspace (2 files)
- **Status**: ✅ Convex integration layer

#### 9. **@qentrah/domain-contracts** (Domain Contracts)
- **Purpose**: Shared DTOs, Zod schemas, and server contract types
- **Exports**: qentrah-pro, compliance, errors, files, gcc-countries, notifications, oauth, org-api, organization-api-keys, organizations, profiles, session, subscription-pricing, verifications, workspace, work-os
- **Consumers**: workspace (6 files), marketing (via dependencies)
- **Status**: ✅ Comprehensive domain contracts

#### 10. **@qentrah/location-map** (Location Map)
- **Purpose**: Shared Mapbox location picker and preview components
- **Exports**: react, types
- **Consumers**: workspace (1 file in calendar domain)
- **Status**: ✅ Specialized location component

#### 11. **@qentrah/partner-auth-core** (Partner Auth Core)
- **Purpose**: Internal partner OAuth authorization policy, scope, claim, and resource helpers
- **Exports**: Internal helpers
- **Consumers**: Not found in apps (internal package)
- **Status**: ✅ Internal auth utilities

#### 12. **@qentrah/partner-workspace-sync** (Partner Workspace Sync)
- **Purpose**: Partner workspace synchronization utilities
- **Exports**: Internal sync helpers
- **Consumers**: Not found in apps (internal package)
- **Status**: ✅ Internal sync utilities

#### 13. **@qentrah/platform-core** (Platform Core)
- **Purpose**: Shared platform primitives for auth, session contracts, errors, locale, and app adapters
- **Exports**: auth-next, classnames, convex-api, effect-api, errors, locale, session
- **Consumers**: workspace (4 files), marketing (via dependencies)
- **Status**: ✅ Core platform primitives

#### 14. **@qentrah/testing** (Testing Utilities)
- **Purpose**: Shared test fixtures and Vitest helpers
- **Exports**: oauth, profile, react, repository, route, session, vitest
- **Consumers: Not found in apps (dev dependency)
- **Status**: ✅ Testing utilities

#### 15. **@qentrah/ui** (UI Components)
- **Purpose**: Shared React UI primitives for apps
- **Exports**: admin, auth, chat, docs, forms, oauth, public, workspace, button, dropdown-menu
- **Consumers**: workspace (1 file in clients domain)
- **Status**: ✅ Comprehensive UI component library

#### 16. **@qentrah/web-foundation** (Web Foundation)
- **Purpose**: Shared Next/web foundation helpers for Qentrah apps
- **Exports**: api, auth-session, convex-provider, media, fonts, locale, theme
- **Consumers**: workspace (via dependencies)
- **Status**: ✅ Web app foundation layer

### Dead Code Packages (No Consumers)

#### 17. **@qentrah/compliance-logic** ❌
- **Purpose**: Pure compliance status and organization-type helpers
- **Logic**: 12 lines of org-type normalization and compliance helpers
- **Consumers**: None found anywhere in monorepo
- **Recommendation**: Remove (dead code)

#### 18. **@qentrah/market-logic** ❌
- **Purpose**: Pure market intelligence normalization and helper logic
- **Logic**: 5,541 lines of market intelligence normalizers
- **Consumers**: None found anywhere in monorepo
- **Recommendation**: Remove (dead code)

#### 19. **@qentrah/offers-logic** ❌
- **Purpose**: Pure offers and offer-case state logic
- **Logic**: 70 lines of offer case state logic
- **Consumers**: None found anywhere in monorepo
- **Recommendation**: Remove (dead code)

#### 20. **@qentrah/base-logic** ❌
- **Purpose**: Pure shared base logic helpers for text normalization, language detection, parsing, retry, providers, and error utility types
- **Logic**: Utility helpers (text, retry, http, language, etc.)
- **Consumers**: None found anywhere in monorepo
- **Recommendation**: Remove (dead code)

## Applications Analysis

### 1. **@qentrah/workspace** (Main Workspace App)
- **Type**: Next.js desktop app with Electron
- **Purpose**: Qentrah Workspace desktop app for workspace operations and partner authorization
- **Key Architecture**:
  - **Server Domain Services**: 18 domains with services, handlers, validation
  - **View Models**: 34 view-model files for presentation layer
  - **Convex Functions**: 160+ Convex functions organized by domain
  - **Surface Pattern**: 6 Surface files (admin, agents, billing, mcp, workspace)
- **Package Dependencies**: 10 @qentrah packages
- **Status**: ✅ Well-structured with clear domain separation

### 2. **@qentrah/marketing** (Marketing Site)
- **Type**: Next.js marketing site with Payload CMS
- **Purpose**: Public website app deployed separately from Workspace
- **Key Architecture**:
  - **Payload CMS**: Collections for blog, FAQs, landing sections, legal pages, media, pricing plans, team members
  - **Blocks**: 7 content blocks (CTA, Feature Grid, Hero, Image Text, Rich Text, Stats, Testimonial)
  - **Localization**: i18n support with request/routing
  - **SEO**: Comprehensive SEO utilities and JSON-LD
- **Package Dependencies**: 2 @qentrah packages (brand-identity, domain-contracts)
- **Status**: ✅ Clean separation from private workspace runtime

### 3. **@qentrah/mobile** (Mobile App)
- **Type**: Expo React Native app
- **Purpose**: Mobile companion app
- **Key Architecture**:
  - **Foundation**: Auth, conversation, foundation (haptics, keyboard, localization, primitives, system, theme)
  - **Conversation**: Agent protocol, composer, hooks, presentation libraries
  - **Persistence**: Analytics, storage
  - **Shell**: App providers, error handling, splash screens
  - **Voice**: Recording visualization
- **Package Dependencies**: 0 @qentrah packages (uses Convex directly)
- **Status**: ✅ Self-contained mobile architecture

## Architecture Patterns Identified

### 1. **Domain-Driven Design (DDD)**
- **Pattern**: Clear domain separation in workspace app
- **Implementation**: 18 server domains (agents, billing, calendar, clients, deals, opportunities, projects, etc.)
- **Structure**: Each domain has services/, handlers/, validation/ subdirectories
- **Status**: ✅ Well-implemented DDD pattern

### 2. **Service Layer Pattern**
- **Pattern**: Business logic encapsulated in domain services
- **Implementation**: 
  - `clients/services/clients.ts` with `clientBusinessRules`
  - `projects/services/projects.ts` with `projectBusinessRules`
  - Generic `service-factory.ts` for CRUD operations
- **Status**: ⚠️ Partially implemented (deals and opportunities lack business rules)

### 3. **Presentation Layer Pattern**
- **Pattern**: View models for UI data transformation
- **Implementation**: 34 view-model files across domains
- **Shared Presentation**: `presentWorkspaceRecord` used in most Convex read functions
- **Status**: ✅ Consistent presentation layer pattern

### 4. **Surface Pattern (Convex)**
- **Pattern**: Surface files for domain-specific aggregation and presentation
- **Implementation**: 6 Surface files (admin, agents, billing, mcp, workspace)
- **Purpose**: Domain-specific data aggregation and presentation logic
- **Status**: ✅ Good separation of concerns

### 5. **Package Architecture**
- **Pattern**: Monorepo with shared packages
- **Categories**:
  - Core platform: platform-core, brand-identity
  - Auth: auth, auth-client, auth-sdk, authorization, partner-auth-core
  - UI: ui, ag-ui, calendar-kit, location-map
  - Domain: domain-contracts, convex-adapters, web-foundation
  - Testing: testing
- **Status**: ✅ Well-organized package structure

### 6. **Lifecycle Documentation Pattern**
- **Pattern**: Lifecycle docs for complex features
- **Implementation**: 13 lifecycle directories with README, changes, files, flow, risks, tests
- **Examples**: AI confirmation approval bar, billing tamara-to-dodo, conversation thread list, project spaces
- **Status**: ✅ Excellent documentation practice

## Key Findings

### Strengths
1. **Clear Domain Separation**: Workspace app has well-defined domain boundaries
2. **Consistent Patterns**: View models, services, and validation follow consistent patterns
3. **Package Organization**: Packages are well-categorized by purpose
4. **Lifecycle Documentation**: Complex features have comprehensive lifecycle docs
5. **Brand Management**: Centralized brand identity with sync scripts

### Areas for Improvement
1. **Dead Code**: 4 packages with no consumers (compliance-logic, market-logic, offers-logic, base-logic)
2. **Incomplete Service Layer**: Deals and opportunities domains lack extracted business rules
3. **Custom Presentation**: Clients domain has custom presentation logic instead of using shared layer
4. **Package Usage**: Some packages (ag-ui, partner-auth-core, partner-workspace-sync) have unclear consumers

## Recommendations

### Immediate Actions
1. **Remove Dead Code Packages**:
   - Remove `packages/compliance-logic`
   - Remove `packages/market-logic`
   - Remove `packages/offers-logic`
   - Remove `packages/base-logic`
   - Verify no external dependencies before removal

2. **Complete Service Layer**:
   - Extract business rules for deals domain into `deals/services/deals.ts`
   - Extract business rules for opportunities domain into `opportunities/services/opportunities.ts`
   - Follow pattern established for clients and projects

3. **Standardize Presentation**:
   - Evaluate if clients PII handling can be abstracted into shared presentation layer
   - Consider making custom presentation functions composable

### Future Improvements
1. **Package Usage Audit**:
   - Verify consumers for ag-ui, partner-auth-core, partner-workspace-sync
   - Document intended usage patterns for each package

2. **Architecture Documentation**:
   - Document the Surface pattern in Convex functions
   - Document the service factory pattern usage
   - Create architecture decision records for key patterns

3. **Testing Strategy**:
   - Add tests for business rules in services
   - Ensure view models have test coverage
   - Consider integration tests for domain services

## File Statistics

### Packages
- **Total Packages**: 21
- **Active Packages**: 16
- **Dead Code Packages**: 4
- **TypeScript Files**: ~200+ (estimated)
- **Test Files**: ~30+ (estimated)

### Apps
- **Workspace App**: ~600+ TypeScript/TSX files
- **Marketing App**: ~85 TypeScript/TSX files
- **Mobile App**: ~110 TypeScript/TSX files

### Documentation
- **Lifecycle Docs**: 13 directories with 40+ markdown files
- **Analysis Docs**: 3 markdown files
- **Design Docs**: 1 markdown file

### Scripts
- **Build Scripts**: 4 (brand-assets, brand-scan, brand-sync, postinstall)
- **Utility Scripts**: 1 (vercel-ignore)

## Conclusion

The Qentrah codebase demonstrates strong architectural patterns with clear domain separation, consistent presentation layer implementation, and comprehensive lifecycle documentation. The main areas for improvement are removing dead code packages and completing the service layer for deals and opportunities domains. The monorepo structure is well-organized with appropriate package boundaries and dependencies.
