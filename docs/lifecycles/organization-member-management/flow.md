# Flow

## Member Removal

1. User opens Workspace organization settings and chooses remove on a member row.
2. UI checks `canRemoveMembers` from organization capabilities before enabling removal.
3. Browser calls `DELETE /api/v1/organizations/:organizationId/members/:memberId`.
4. Hono handler validates route params and calls `removeOrganizationMember`.
5. Service reads the Better Auth session.
6. Service checks organization `member:delete` through Better Auth permissions.
7. Service lists members and applies Qentrah policy:
   - current user cannot remove themselves
   - last owner cannot be removed
   - target member must exist
8. Service calls Better Auth `/organization/remove-member`.
9. Service records an organization audit event in Convex.

## Source Of Truth

- Better Auth: organization membership, roles, and permission decision.
- Workspace service layer: Qentrah safety policy and audit event.
- Convex audit table: historical record of the action.
- `PLATFORM_ADMIN_EMAILS`: platform/operator-only actions, not normal organization member removal.
