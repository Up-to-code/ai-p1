# Risk Policy

High-risk operations require `needsApproval: true` in the tool definition. The Eve framework will automatically prompt the user for confirmation before executing these tools.

## Risk Categories

| Category | Tools | Policy |
|---|---|---|
| `member_delete` | `members-remove` | Requires user approval |
| `organization_identity` | `organization-update-identity`, `organization-update-profile` | Requires user approval |
| `entity_delete` | `clients-delete`, `deals-delete`, `projects-delete`, `tasks-delete`, `calendar-delete` | Requires user approval |

## Implementation

Set `needsApproval: true` on the tool definition:

```ts
export const membersRemove = defineTool({
  id: "members_remove",
  needsApproval: true,
  // ...
});
```

The Eve framework handles the confirmation dialog automatically. No custom confirmation logic is needed.
