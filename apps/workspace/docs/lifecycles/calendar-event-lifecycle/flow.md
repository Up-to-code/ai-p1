# Flow

1. A transport validates either its presentation input or the canonical timestamp contract.
2. The adapter derives Organization and actor scope.
3. The lifecycle loads and merges persisted state for patches.
4. It validates the resulting interval and every linked record.
5. One Convex transaction persists the event, replaces/cancels reminders, and appends audit.
6. Presentation adds stable `date` and `time` fields.

MCP and Eve submit omission-preserving patches and never mirror the full event client-side.
