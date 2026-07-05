# Files Involved in Documents Redesign

## Core UI Files
- `apps/workspace/src/app/[locale]/(app)/docs/page.tsx` - Main page entry point (currently just renders DocsPageRedesigned)
- `apps/workspace/src/domains/docs/components/DocsPageRedesigned.tsx` - Current documents UI with view switcher, tab bar, and modal editor
- `apps/workspace/src/domains/docs/components/docs-screen.tsx` - Alternative documents screen implementation (may be used as reference)
- `apps/workspace/src/domains/docs/components/doc-editor.tsx` - Document editor component (currently modal-based, needs full-screen conversion)

## New Route Structure
- `apps/workspace/src/app/[locale]/(app)/docs/[docId]/page.tsx` - NEW: Full-screen document editor page route

## API & Types
- `apps/workspace/src/domains/docs/api/docs.ts` - Document API functions (create, update, delete, move)
- `apps/workspace/src/domains/docs/docs.types.ts` - Document type definitions
- `apps/workspace/src/domains/docs/docs.constants.ts` - Document constants (emptyDoc, etc.)

## Supporting Components
- `apps/workspace/src/domains/docs/components/doc-create-form.tsx` - Document creation form
- `apps/workspace/src/domains/docs/components/doc-create-dropdown.tsx` - Document creation dropdown
- `apps/workspace/src/domains/docs/components/doc-folder-picker-modal.tsx` - Folder picker modal
- `apps/workspace/src/domains/docs/components/doc-folder-tree.tsx` - Folder tree component
- `apps/workspace/src/domains/docs/components/doc-list-view.tsx` - Document list view
- `apps/workspace/src/domains/docs/components/doc-grid-view.tsx` - Document grid view (may be removed)
- `apps/workspace/src/domains/docs/components/doc-row-actions.tsx` - Document row actions
- `apps/workspace/src/domains/docs/components/doc-skeleton.tsx` - Loading skeleton

## Utilities
- `apps/workspace/src/domains/docs/lib/folder-utils.ts` - Folder utilities (breadcrumb path, subfolders)

## Hooks
- `apps/workspace/src/domains/docs/hooks/use-optimistic-actions.ts` - Optimistic update hooks

## Shared Components
- `apps/workspace/src/components/shared/domain/DomainHeader.tsx` - Domain header component (used in current design)
- `apps/workspace/src/components/shared/work-os-doc-editor.tsx` - Rich text editor component
- `apps/workspace/src/components/shared/view-system/ViewSwitcher.tsx` - View switcher (will be removed)

## Why Each Matters
- `DocsPageRedesigned.tsx` is the main UI that needs simplification
- `doc-editor.tsx` needs conversion from modal to full-screen page
- New route structure needed for full-screen editor
- API functions remain the same but need integration with new routing
- Type definitions may need extension for custom fields
- Supporting components may need updates for new UX patterns
