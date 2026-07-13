# Calendar Event Lifecycle

Purpose: own Calendar event persistence, linked-record validation, time ordering, reminders, audit, and soft deletion behind one Convex transaction Interface.

Invariants:

- `endAt` is never earlier than `startAt`, including partial updates merged with persisted state.
- Client, Project, Task, and Document links must be active records in the same Organization.
- Every create/update replaces queued reminders using the resulting persisted event.
- Delete is soft, cancels queued reminders once, and repeated deletion fails closed.
- Public and internal adapters produce the same Organization audit effects.

Public Interface: `createCalendarEvent`, `updateCalendarEvent`, and `deleteCalendarEvent` in `convex/calendar/lifecycle.ts`.

Authorization: public Convex adapters derive the Better Auth actor and assert Calendar capability. MCP supplies a server-derived scoped actor before calling the internal adapter.
