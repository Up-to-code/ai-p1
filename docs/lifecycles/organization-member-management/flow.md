# Flow

## Member Removal

1. User opens Workspace organization settings and chooses remove on a member row.
2. UI checks `canRemoveMembers` from organization capabilities before enabling removal.
3. Browser calls `DELETE /api/v1/organizations/:organizationId/members/:memberId`.
4. Hono handler validates route params and calls `removeOrganizationMember`.
5. Service reads the WorkOS AuthKit session.
6. Service checks organization `member:delete` through the Convex WorkOS membership projection and permission slugs.
7. Service lists members and applies Qentrah policy:
   - current user cannot remove themselves
   - last owner cannot be removed
   - target member must exist
8. Service calls WorkOS `deleteOrganizationMembership`.
9. Service records an organization audit event in Convex.

## Source Of Truth

- WorkOS: organization membership, invitations, custom roles, and role permission slugs.
- Workspace Convex: local membership projection, Qentrah safety policy, permission enforcement, and audit event.
- Convex audit table: historical record of the action.
- `PLATFORM_ADMIN_EMAILS`: platform/operator-only actions, not normal organization member removal.
