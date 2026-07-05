# Current/New Flow for Documents Redesign

## Current Flow

### Document List View
1. User navigates to `/docs`
2. `DocsPageRedesigned` component renders with:
   - DomainHeader with view switcher (table/board/calendar/timeline/dashboard/widgets)
   - Breadcrumb navigation bar
   - Combined table showing folders and documents
   - New Doc button in header
   - New Folder button in toolbar
   - Search bar in toolbar
3. User can switch between different view modes (table, board, calendar, etc.)
4. Document editor opens as modal overlay with fullscreen toggle

### Document Creation
1. User clicks "New Document" button in header
2. Modal form appears for document title
3. Document created and added to list
4. Editor modal opens for new document

### Folder Creation
1. User clicks "New Folder" button in toolbar
2. Simple input field appears
3. Folder created and added to tree

### Document Editing
1. User clicks on document in table
2. Document editor opens as modal
3. User can toggle fullscreen mode
4. Changes auto-save on blur
5. Close button closes modal

## New Flow

### Document List View
1. User navigates to `/docs`
2. Simplified page renders with:
   - Simple header with title and action buttons (New Doc, New Folder)
   - Breadcrumb navigation bar (simplified)
   - Full-width table with background styling
   - Search bar (simplified)
   - NO view switcher
   - NO tab bar
3. Only table view available (no board/calendar/timeline/dashboard/widgets)
4. Documents and folders shown in clean list

### Document Creation
1. User clicks "New Document" button in header
2. Simple inline form or modal for document title
3. Document created and user navigated to full-screen editor page
4. URL changes to `/docs/[docId]`

### Folder Creation with Guidance
1. User clicks "New Folder" button in header
2. Guidance UI appears explaining folder structure
3. User prompted to create first document in folder
4. Folder created with visual feedback

### Document Editing (Full-Screen Page)
1. User clicks on document in table
2. Navigation to `/docs/[docId]` (full-screen page)
3. Full-screen editor with:
   - Back button to return to list
   - Save button
   - Delete button
   - Full rich text editor
   - Custom fields panel
4. Changes auto-save
5. Browser back/forward navigation works

## Upstream Dependencies
- Convex documents API (api.clientDocs.*)
- Authentication/organization context
- Router navigation

## Downstream Dependencies
- Project documents tabs (may need updates)
- Client documents tabs (may need updates)
- Global search (indexes documents)
- MCP document tools

## Breaking Changes
- Document editor URL changes from query param to route param
- View switcher removed (board/calendar/timeline views no longer available)
- Modal-based editor removed
- Some components may be deleted (doc-grid-view, etc.)

## Migration Notes
- Update any deep links to documents from `?docId=` to `/docs/[docId]`
- Update any references to view switcher
- Remove unused view components
