# Calendar composer deepening

## Module boundaries

- `calendar-event-form-dialog.tsx` renders the Notion-style composer and type-specific property rows.
- `use-calendar-composer-options.ts` owns live task, document, and project option loading.
- Calendar schemas and write handlers own persistence and organization validation for linked resources.
- Existing calendar page and project calendar tab remain the orchestration points for create, update, and delete mutations.

## Passes

1. Replace the generic boxed form with a page-like composer using shared UI primitives.
2. Make the selected calendar item type determine visible fields and body copy.
3. Add a first-class document calendar type and document relationship.
4. Validate every linked client, project, task, or document against the calendar event organization before writes.

## Parity checks

- Existing meeting, deadline, reminder, milestone, and focus events still render and edit.
- Switching type clears incompatible hidden relationship fields.
- Meeting-only fields do not appear for tasks, documents, reminders, milestones, or focus blocks.
- Task, document, and project pickers use live workspace records.
- Create, update, and delete still use the existing calendar API and permission checks.
