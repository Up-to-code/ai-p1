# Current State Audit

This audit is the starting evidence for the hard reset. Re-run the searches in
T00 before implementation because the worktree is already changing.

## Known active surfaces with real-estate thinking

- Workspace project UI and validation still references developer, REGA, units,
  inventory, bedrooms, and bathrooms.
- Client pipeline and linked record UI still uses unit and viewing language.
- Calendar event types still include viewing-oriented labels.
- Asset cards and schemas still contain property-style attributes in places.
- Agent tool inputs and MCP catalog still use client-task and real-estate terms.
- Domain contracts still include broker, developer, property, offer, deal, and
  verification language that must be classified or replaced.
- Public routes, robots metadata, docs, and marketing copy still contain broker,
  developer, property, and real-estate positioning.

## Existing Work OS progress

- Work OS glossary terms exist in `CONTEXT.md`.
- Placeholder routes exist for opportunities, tasks, and automations.
- Some Work OS schema and contract files have been started.
- Property routes and property modules appear partially deleted.

## Risk

The repo has broad uncommitted work. Every implementation task must inspect
current files before acting and must not revert unrelated user changes.
