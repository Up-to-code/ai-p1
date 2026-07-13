# Flow

1. A transport validates the canonical create or patch contract.
2. The adapter derives actor and Organization, then authorizes the existing and resulting Task scope.
3. The lifecycle merges patches with persisted state and validates links and Project date policy.
4. One Convex transaction persists the Task and completion transition.
5. Project rollups, reminders, assignments, mentions, and Organization audit update in that transaction.
6. Presentation supplies stable `id` and visibility defaults to consumers.

MCP and Eve never copy query results into a second authoritative Task input. Completion is a dedicated command or a `{status: "done"}` lifecycle patch.
