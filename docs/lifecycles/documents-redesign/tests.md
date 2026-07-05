# Tests for Documents Redesign

## Existing Tests
- No specific test files found in `domains/docs/` directory
- General component testing patterns may exist in workspace

## Test Coverage Needed

### Unit Tests
- Document list rendering with simplified UI
- Folder creation with guidance UI
- Navigation to full-screen editor
- Custom fields rendering and editing
- Breadcrumb navigation
- Search functionality

### Integration Tests
- Document creation flow
- Document editing flow
- Folder creation flow
- Navigation between list and editor
- Auto-save functionality
- Custom fields persistence

### E2E Tests
- Complete document creation workflow
- Complete document editing workflow
- Folder creation with first document
- Navigation and routing
- Browser back/forward button behavior

## Manual Testing Checklist

### Document List View
- [ ] Page loads without view switcher
- [ ] Table takes full width with proper background
- [ ] New Doc and New Folder buttons visible in header
- [ ] Breadcrumb navigation works
- [ ] Search filters documents correctly
- [ ] Folders and documents display correctly
- [ ] Clicking folder navigates into folder
- [ ] Clicking document navigates to editor page

### Document Creation
- [ ] New Doc button opens creation form
- [ ] Document creation navigates to editor page
- [ ] URL updates to `/docs/[docId]`
- [ ] Document appears in list after creation

### Folder Creation
- [ ] New Folder button shows guidance UI
- [ ] Guidance explains folder structure
- [ ] Folder creation works with first document prompt
- [ ] Folder appears in tree after creation

### Full-Screen Editor
- [ ] Editor page loads at `/docs/[docId]`
- [ ] Back button returns to list
- [ ] Save button works
- [ ] Auto-save on blur works
- [ ] Custom fields panel renders
- [ ] Custom fields save correctly
- [ ] Delete functionality works
- [ ] Browser back button works
- [ ] Browser forward button works

### Routing
- [ ] Direct navigation to `/docs/[docId]` works
- [ ] Invalid docId shows error state
- [ ] Navigation preserves search state
- [ ] Breadcrumb navigation works from editor

## Commands to Run
```bash
# Run workspace tests
cd apps/workspace
npm test

# Run E2E tests (if available)
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Missing Coverage
- No existing domain-specific tests for documents
- No E2E tests for document workflows
- No routing tests for new page structure
- Custom fields not yet implemented (no tests)
