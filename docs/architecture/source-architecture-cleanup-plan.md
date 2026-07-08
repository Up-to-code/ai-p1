# Source Architecture Cleanup Plan

Status: Active cleanup backlog  
Scope: `apps/workspace/src`, `apps/workspace/convex`

## Goal

Keep route files, providers, Convex modules, and UI components small enough to scan and change safely. Files over 200 lines need a reason to stay whole. Files over 300 lines are candidates for extraction unless they are generated code or intentionally declarative configuration.

## Rules

- Route files compose. Metadata, helpers, data arrays, and business logic live outside route files.
- Components render. Non-trivial filtering, matching, calculations, option lists, and formatting live in local helpers/data/type files.
- Shared UI used by multiple domains becomes a folder and is registered in `component-registry.json`.
- Convex modules use canonical domain names. Compatibility names like `userTableViews` must not remain after the schema path is replaced.
- Convex query data is real-time source data. Do not copy query results into effect-synced local state for rendering.
- Provider files compose provider trees. Redirect helpers, timeouts, and performance markers live in provider-local hooks/helpers.

## Completed Passes

### Pass 1: Route Loading Split
Current behavior: `workspace-route-loading.tsx` held all route skeletons and the brand loader in one 400-line file.

Structural improvement: Split into `components/loading/workspace-route-loading/` modules and kept the original import path as a small dispatcher.

Validation check: `architecture-cleanup-source.test.ts`, typecheck.

### Pass 2: Dashboard Shell Helper Split
Current behavior: `dashboard-authenticated-shell.tsx` mixed provider composition, auth redirect calculation, redirect effects, timeout state, and performance markers.

Structural improvement: Moved redirect calculation/effects and performance markers into provider-local hooks under `components/providers/dashboard-authenticated-shell/`.

Validation check: `auth-route-source.test.ts`, typecheck.

### Pass 3: Saved Views Naming
Current behavior: Canonical `savedViews` data still lived under `convex/userTableViews`, and frontend code called `api.userTableViews`.

Structural improvement: Moved Convex modules to `convex/savedViews` and updated frontend calls to `api.savedViews`.

Validation check: `architecture-cleanup-source.test.ts`, Convex codegen.

### Pass 4: Sidebar Inbox Split
Current behavior: `sidebar-inbox-panel.tsx` mixed option data, types, filtering helpers, icon picker, channel section UI, loading/empty states, and composition.

Structural improvement: Extracted inbox panel `data`, `types`, `channel-filter`, `icon-picker`, and `channel-section` under a local folder.

Validation check: `architecture-cleanup-source.test.ts`, typecheck.

### Pass 5: Metadata Boundary
Current behavior: root metadata lived in `app/layout.tsx`, while localized metadata lived in `app/[locale]/seo/metadata.ts`.

Structural improvement: Centralized app metadata in `src/metadata/workspace.ts`; layouts import metadata rather than owning it.

Validation check: `architecture-cleanup-source.test.ts`, typecheck.

## Next Passes

### Pass 6: Shared Avatar Upload Boundary
Current behavior: `profile-picture-uploader.tsx` and `organization-logo-uploader.tsx` duplicate upload flow, preview, validation, and progress UI.

Structural improvement: Extract a shared avatar/logo uploader view model and reusable upload shell. Keep profile/organization request functions domain-specific.

Validation check: existing profile picture tests plus organization logo source test.

### Pass 7: AI Composer Folder
Current behavior: `ai-composer.tsx` combines prompt input UI, attachment display, menus, state transitions, and submission controls.

Structural improvement: Move composer state/types/data into `components/dashboard/ai-composer/`, with small private subcomponents for attachment chips, menu trigger, and submit controls.

Validation check: typecheck plus source guard that `ai-composer.tsx` remains a composer under 120 lines.

### Pass 8: Eve Dashboard Chat Split
Current behavior: `eve-dashboard-chat.tsx` mixes Eve hook orchestration, message rendering, empty/loading states, and thread controls.

Structural improvement: Move message list, header, empty state, and thread controls into `components/dashboard/eve-dashboard-chat/`; keep Convex/Eve data in hooks.

Validation check: typecheck and manual `/ai` smoke test.

### Pass 9: Custom Fields Helpers
Current behavior: `custom-fields-settings.tsx` and shared custom-field renderers contain formatting, option normalization, and section-building helpers inline.

Structural improvement: Move formatting and field-value coercion into `domains/custom-fields/lib/` and keep rendering components thin.

Validation check: add field formatter unit tests.

### Pass 10: Convex Domain File Split
Current behavior: several Convex modules exceed 250 lines (`inbox/write.ts`, `billing/write.ts`, `mcp/connections.ts`, `partnerResourceGateway.ts`).

Structural improvement: Split into the standard `validators.ts`, `data.ts`, `policy.ts`, `read.ts`, `write.ts`, `present.ts`, `lifecycle.ts` shape where missing.

Validation check: Convex codegen, typecheck, and domain-specific source guards.
