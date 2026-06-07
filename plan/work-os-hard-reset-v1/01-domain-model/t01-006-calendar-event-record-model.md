# T01-006 - Calendar Event Record Model

Status: [x]
Workstream: Domain Model
Depends on: T01-001

Goal:
Define Calendar Event as a generic scheduled work record.

Inputs:
- Existing calendar schemas, store, screen, and server validation

Steps:
- Define fields: title, type, start, end, owner, attendees, location, meeting link, notes.
- Define linked records: client, opportunity, project, task, asset.
- Define default types: meeting, deadline, reminder, milestone, focus block.
- Define calendar and agenda views.

Traps:
- Do not keep site-viewing or viewing as a default event type.
- Do not require property, client, or asset context for every event.

Acceptance:
- Calendar supports generic scheduled work.
- Old viewing language is removed or classified as template-specific.

Tests:
- `rg -n "viewing|site-viewing|property|unit" apps/workspace/src/domains/calendar apps/workspace/src/server/domains/calendar apps/workspace/convex/calendar`

Completion note:
- Completed on 2026-06-06.
- Evidence: [domain-interface-spec.md](../domain-interface-spec.md) defines the
  Calendar event purpose, fields, event types, views, AI actions, automation
  triggers, and links.
- The model excludes site-viewing, viewing, property, and unit as default event
  assumptions.
