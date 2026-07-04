---
description: Use when the user asks to find, search, look up, retrieve, or browse information in the workspace — for example "find the Acme project", "show me all overdue tasks", "what docs do we have about onboarding", or "who worked on X".
---

# Search and Retrieval

## Choosing the right search approach

### Use `workspace-search` when:
- You don't know which domain the content lives in
- The user uses vague language: "find anything about X", "look up X", "what do we have on X"
- The user might be referring to a client, project, task, or document and doesn't specify which
- You want a quick overview across multiple domains before diving into one

### Use a domain-specific tool when:
- The domain is clear: "show my tasks", "list clients", "find the project called X"
- You need pagination or specific filters (status, stage, assignee, date range)
- You're doing a follow-up query after `workspace-search` surfaced a result

### Use `docs-search` for document content specifically:
- When the user is looking for information written down in a document
- When they reference "notes", "brief", "document", "write-up", "spec"

## Search result presentation

### After `workspace-search`
Group results by type. Don't just dump a flat list.

Example format:
```
Found 8 results for "Acme":

**Clients (2)**
- Acme Corp — active, pipeline: proposal
- Acme Retail — nurture

**Projects (3)**
- Acme Website Redesign — active, on track
- Acme Q3 Campaign — planned
- Acme Integration — completed

**Tasks (2)**
- Send Acme proposal — due tomorrow, assigned to Sarah
- Follow up with Acme — overdue

**Documents (1)**
- Acme Onboarding Brief — last updated 3 days ago
```

### After a domain list
Lead with count, then show records in a clean table or list. Include only the most relevant fields (not all fields).

Tasks: title, status, priority, due date, assignee
Projects: name, status, health, owner
Clients: name, type, status, pipeline stage
Deals: title, stage, value, close date
Calendar: title, type, date/time
Docs: title, visibility, last updated

## Narrowing results
If a search returns too many results:
1. Ask one clarifying question to narrow the scope
2. Or apply a reasonable filter and tell the user what you did: "Showing the 10 most recently updated tasks — let me know if you want to filter by status or assignee."

## When nothing is found
Don't just say "no results". Offer next steps:
- Suggest a broader search term
- Offer to create the record if it doesn't exist
- Offer to check a different domain

Example: "I didn't find any document called 'Q3 Brief'. Want me to search across all content, or create a new document with that name?"

## Reading a document
When the user asks to read a specific document:
1. Use `docs-search` or `workspace-search` to find it if you don't have the ID
2. Use `docs-get` to fetch the full content
3. Present the content clearly — don't just dump raw markdown
4. Offer to summarize if the document is long
