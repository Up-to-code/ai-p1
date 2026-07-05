# Risks for Documents Redesign

## Coupling Risks

### Project Documents Tab
- **Risk**: Projects detail view has documents tab that may depend on current modal pattern
- **Impact**: Breaking change if tab expects modal behavior
- **Mitigation**: Check and update `domains/projects/components/detail/tabs/documents-tab.tsx`
- **Status**: Needs investigation

### Client Documents Tab  
- **Risk**: Clients detail view has documents tab that may depend on current modal pattern
- **Impact**: Breaking change if tab expects modal behavior
- **Mitigation**: Check and update `domains/clients/components/detail/tabs/documents-tab.tsx`
- **Status**: Needs investigation

### Global Search Integration
- **Risk**: Global search may link to documents using old query param pattern
- **Impact**: Broken deep links to documents
- **Mitigation**: Update search result links to use new route pattern
- **Status**: Needs investigation

### MCP Document Tools
- **Risk**: MCP tools may reference document URLs or patterns
- **Impact**: Broken tool navigation or references
- **Mitigation**: Update MCP tool implementations if needed
- **Status**: Needs investigation

## Known Breakpoints

### URL Pattern Change
- **Breakpoint**: Document URLs change from `?docId=` query param to `/docs/[docId]` route
- **Risk**: All existing deep links break
- **Mitigation**: Implement redirect handler for old pattern
- **Status**: Plan to implement redirect

### View Switcher Removal
- **Breakpoint**: Users who rely on board/calendar/timeline views lose functionality
- **Risk**: User workflow disruption
- **Mitigation**: Communicate change clearly, consider if any views are critical
- **Status**: User feedback needed

### Component Deletion
- **Breakpoint**: Some components may be deleted (doc-grid-view, etc.)
- **Risk**: Breaking imports if used elsewhere
- **Mitigation**: Search for usages before deletion
- **Status**: Needs usage analysis

## Environment/Secrets
- **Risk**: None identified - no new environment variables or secrets needed

## Schema/Data Compatibility
- **Risk**: Custom fields addition may require schema changes
- **Impact**: Convex schema may need updates for custom fields
- **Mitigation**: Plan schema migration if needed
- **Status**: Needs Convex schema review

## Migration Order
1. Create new route structure alongside existing
2. Update document list UI to use new routing
3. Update project/client documents tabs
4. Update global search links
5. Update MCP tools if needed
6. Test all navigation paths
7. Remove old modal-based code
8. Clean up unused components

## Rollback Notes
- Keep old modal-based code in branch until new flow is fully tested
- Database changes should be backward compatible
- URL redirect can handle old pattern if rollback needed
- Feature flag could control old vs new flow if needed

## Cross-App Coupling
- **apps/marketing**: May reference documents in marketing content (unlikely to break)
- **apps/mobile**: Mobile app may have documents feature (needs investigation)
- **packages/ui**: Shared UI components used (should be compatible)

## Performance Risks
- **Risk**: Full-page navigation may be slower than modal
- **Mitigation**: Use Next.js client-side navigation, implement loading states
- **Status**: Monitor performance after implementation

## UX Risks
- **Risk**: Users may prefer modal over full-page for quick edits
- **Mitigation**: Make navigation fast, consider keeping modal as optional
- **Status**: User feedback needed after implementation
