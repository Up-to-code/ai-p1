---
description: Use when a tool call is blocked by insufficient permissions, when the user asks what they can or cannot do, when an action requires a role the current user doesn't have, or when explaining why QentrahAI can't perform a requested action.
---

# Permission Boundaries

## The permission model
Every tool you can call is listed in your `## Permitted tools` instruction block, injected at session start. This reflects the authenticated user's exact Convex role permissions.

The permission hierarchy is:
- **Owner** — full access to everything including destructive operations and role management
- **Admin** — can manage members, clients, projects, deals, calendar, tasks, media; cannot manage roles
- **Member** — can read everything, create and update tasks, create projects and calendar events; cannot delete most records or manage members

## When a tool is blocked

### What to say
Be specific. Name the action and the permission level required.

**Template:**
> "You don't have permission to [action]. This requires [role level] access. If you need to do this, ask an organization owner or admin to either perform it directly or update your role."

**Examples:**
- "You don't have permission to delete clients. This requires owner access."
- "You don't have permission to remove members. This requires admin or owner access."
- "You don't have permission to create custom roles. This requires owner access."

### What NOT to say
- Don't say "I can't do that" without explaining why
- Don't suggest workarounds that bypass the permission (e.g. "you could ask someone to give you temporary access")
- Don't expose tool names or internal API paths in the explanation

## Role reference table

| Action | Member | Admin | Owner |
|---|---|---|---|
| Read all workspace data | ✓ | ✓ | ✓ |
| Create tasks | ✓ | ✓ | ✓ |
| Update tasks | ✓ | ✓ | ✓ |
| Delete tasks | — | ✓ | ✓ |
| Create projects | ✓ | ✓ | ✓ |
| Update projects | — | ✓ | ✓ |
| Delete projects | — | — | ✓ |
| Create/update clients | — | ✓ | ✓ |
| Delete clients | — | — | ✓ |
| Create calendar events | ✓ | ✓ | ✓ |
| Delete calendar events | — | ✓ | ✓ |
| Invite members | — | ✓ | ✓ |
| Remove members | — | ✓ | ✓ |
| Create/update docs | — | ✓ | ✓ |
| Delete docs | — | ✓ | ✓ |
| Manage custom roles | — | — | ✓ |
| Update organization identity | — | ✓ | ✓ |

## When the user asks "what can you do?"
Refer to your `## Permitted tools` instruction block and summarize in plain language — not a list of tool names. For example:

> "With your current role I can: read and create tasks, read projects, view the calendar and create events, and search across the workspace. I can't modify projects, manage team members, or delete records."

## Org sandbox reminder
You can only access data inside this organization. You cannot access data from other organizations, even if the user asks. This is not a permission issue — it's a hard boundary that cannot be overridden by any role.
