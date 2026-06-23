# Risks

## Schema Compatibility
- Adding `spaceId` as optional field to existing tables is backward-compatible
- Existing queries without `spaceId` filter continue to work
- No migration needed for existing data

## Slug Uniqueness
- Slug must be unique within a project, not globally
- Validation requires a query check before insert/update
- Race condition possible — use Convex's atomic operations

## Performance
- New index `by_organization_project_space` needed for efficient space queries
- Without index, space queries would scan all project items
- Index size impact is minimal (optional field)

## Cross-Space Assignment
- No separate membership model — uses existing project membership
- Notification payload needs space context added
- Assignment dropdown must show all project members, not just space members

## Deletion Behavior
- Deleting space must clear `spaceId` from all items atomically
- If mutation fails partway, items could be orphaned
- Use Convex transaction to ensure atomicity

## URL Structure
- Using query param `?space=[slug]` vs nested route `/spaces/[slug]`
- Query param approach is simpler and doesn't require new route files
- Nested route approach is cleaner for deep linking

## Backward Compatibility
- Existing task/calendar APIs continue to work without spaceId
- New space-scoped APIs are additive, not replacing existing ones
- Client code can gradually adopt space context
