# Tests

- **Smoke**: `packages/ui/src/qentrah-table/__tests__/qentrah-table.test.tsx`
  renders the component with two rows and asserts the header + first cell
  appear.
- **Commands**:
  - `npm --workspace @qentrah/ui run test`
  - `npm --workspace apps/workspace run typecheck`
  - `npm --workspace apps/workspace run lint`
- **Manual**:
  - Open the Workspace Table view (project detail) and the Workspace
    Overview Table tab. Verify sort, filter, resize, column reorder, and
    inline edit on the title column.
  - Open Clients table. Verify the same controls work and the existing
    client filters still narrow the dataset.
