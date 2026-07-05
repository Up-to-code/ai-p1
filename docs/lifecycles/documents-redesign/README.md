# Documents Redesign Lifecycle

## Purpose
Redesign the documents section to simplify the UI, improve navigation, and convert the document editor from a modal to a full-screen page route.

## Owner App/Package
- `apps/workspace` - Main workspace application
- `domains/docs` - Documents domain components and logic

## Entrypoints
- `/apps/workspace/src/app/[locale]/(app)/docs/page.tsx` - Main documents page
- `/apps/workspace/src/domains/docs/components/DocsPageRedesigned.tsx` - Current documents UI
- `/apps/workspace/src/domains/docs/components/docs-screen.tsx` - Alternative documents screen
- `/apps/workspace/src/domains/docs/components/doc-editor.tsx` - Document editor component

## Actor/System Flow
1. User navigates to `/docs` 
2. Current: Shows tab bar, view switcher, and document list in modal
3. New: Shows simplified list view with full-width table
4. User clicks "New Document" → Creates document and navigates to full-screen editor
5. User clicks "New Folder" → Shows guidance UI for folder creation
6. User clicks document → Navigates to full-screen editor page instead of modal

## Current Status
- In planning phase
- Lifecycle documentation being created
- Implementation pending approval

## Key Changes
1. Remove view switcher (table/board/calendar/timeline/dashboard/widgets)
2. Remove tab bar from documents page
3. Redesign table to full width with background styling
4. Move New Folder button to top alongside New Doc button
5. Add folder creation guidance UI
6. Convert document editor from modal to full-screen page route
7. Remove strategy-related features
8. Add custom fields support

## Dependencies
- React Router for new page route
- Existing Convex documents API
- Existing document types and API functions
- Component registry patterns (if creating new shareable components)
