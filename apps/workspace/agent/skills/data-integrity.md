---
description: Use when creating, updating, or deleting workspace records to ensure data quality, avoid duplicates, and make safe changes — especially before any write operation when the user's request is ambiguous or when a record by the same name might already exist.
---

# Data Integrity

## Check before create
Before creating any record, consider whether it likely already exists. This matters most for:
- Clients (duplicate companies or contacts)
- Projects (same project started twice)
- Documents (same doc under a different name)
- Tasks (same task already logged)

**When to check:**
- If the user's request is vague: "create a project for Acme" — does one already exist?
- If the name is common or ambiguous
- If the user seems to be re-entering something they've already set up

**How to check:**
1. Call the relevant list or search tool first
2. If a matching record is found, show it and ask: "I found an existing [record type] called **X**. Do you want to update it, or create a new one?"
3. Only create if the user confirms, or if the search clearly returns nothing similar

**When to skip the check:**
- The user is clearly creating something new ("create a fresh project", "add a brand new client")
- You already searched and found nothing matching
- You're in Work mode and the user gave explicit, specific inputs

## Merge before update
When updating a record, always fetch the existing record first and merge — never overwrite fields the user didn't mention.

Pattern:
1. Fetch the existing record
2. Apply only the fields the user specified
3. Keep all other fields unchanged
4. Send the merged object to the update mutation

This prevents: accidentally clearing a due date, wiping assignees, or resetting status when the user only asked to change the title.

## Field validation rules

**Titles and names:**
- Must not be blank
- Trim leading/trailing whitespace before saving
- Max 300 characters for documents, 500 for tasks and projects

**Dates:**
- Accept any human-readable format ("next Monday", "March 15", "2025-03-15")
- Always store as ISO 8601 string (YYYY-MM-DD) or Unix timestamp as required by the schema
- If a date is ambiguous, clarify before saving

**Status and enum fields:**
- Only use values defined in the schema
- If the user gives an unrecognized value, explain the valid options and ask them to choose

**IDs:**
- Never ask the user for an ID — look it up using a search or list tool
- Never expose raw Convex IDs in responses — refer to records by name

## Soft delete safety
All delete operations are soft deletes (set `deletedAt`). Records are not permanently removed.

Even so, confirm before deleting because:
- The user may have said "delete" when they meant "archive" or "complete"
- Deleted records may be referenced by other records (tasks in a project, clients linked to deals)

When confirming a delete, state exactly what will be removed and whether dependent records will be affected.

## Audit trail
Every mutation (create, update, delete) automatically records an audit event in Convex. You don't need to do this manually — `runOrganizationActionWorkflow` handles it. This means every AI-driven change is traceable to the session user.

## After a write operation
Always confirm what was actually saved:
- State the record name (not its ID)
- State which fields changed
- Offer the next logical step if there is one

Example: "Updated task **Send proposal to Acme** — priority changed to urgent, due date set to Friday. Want me to assign it to someone?"
