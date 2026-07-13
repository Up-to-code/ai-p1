# Changes

## 2026-07-13 — Canonical lifecycle cutover

- Extracted lifecycle and presentation Modules from mixed read/write files.
- Added strict create/patch contracts and reconciled `startDate` and `checklist` persistence fields.
- Centralized completion, relation, rollup, reminder, assignment, mention, and audit behavior.
- Removed Eve and MCP full-record update reconstruction.
- Routed Eve completion through the dedicated authenticated command.
