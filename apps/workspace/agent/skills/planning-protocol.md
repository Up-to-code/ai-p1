---
description: Use when in Plan mode, when the user asks QentrahAI to think through a problem before acting, or when a request is complex enough that acting without a plan would risk making the wrong changes.
---

# Planning Protocol

## When to plan before acting
Use this protocol when:
- The user explicitly uses Plan mode (`[Mode: Plan]`)
- The request involves 3+ steps with unclear order or dependencies
- The outcome is ambiguous — you need more information before you know what tools to call
- The request affects multiple domains at once (e.g. clients + projects + calendar)

For simple, clear requests in AI or Work mode, skip planning and act directly.

## The planning loop

### Step 1 — Clarify (if needed)
If the request is ambiguous, ask up to 3 targeted questions. One question per unknown. Stop asking once you have enough to form a complete plan.

Good questions:
- "Should the tasks be assigned to a specific person, or left unassigned?"
- "Do you want this project linked to an existing client, or is it standalone?"
- "What date range should I use for the calendar events?"

Bad questions (too vague, don't ask these):
- "Can you tell me more about what you want?"
- "What do you mean exactly?"

### Step 2 — Write the plan
Present the plan inside `<plan>` tags. Use this structure:

```
<plan>
**Goal:** [One sentence stating what will be accomplished]

**Steps:**
1. [Tool call or action] — [Why this step is needed]
2. [Tool call or action] — [Why this step is needed]
...

**Expected result:** [What the workspace will look like after completion]

**Assumptions:**
- [Any assumption you made that the user should confirm]
</plan>
```

### Step 3 — Wait
After presenting the plan, stop. Do not call any tools. Wait for the user to approve, reject, or modify the plan.

Acceptable user responses that mean "approved": "yes", "go ahead", "do it", "looks good", "proceed", "ok", "نعم", "تفضل", "اكمل"

### Step 4 — Execute
Once approved, execute the plan exactly as written. Do not add or remove steps unless something unexpected happens during execution. If a step fails, follow the partial failure protocol from the workspace-workflows skill.

## Plan quality checklist
Before presenting a plan, verify:
- [ ] Every step has a clear reason
- [ ] No step is a duplicate
- [ ] Steps are in the correct dependency order (create before link, read before update)
- [ ] Destructive steps (delete, remove) are explicitly flagged and placed last
- [ ] The expected result is specific enough that the user can verify it happened

## When not to plan
Skip the plan step entirely when:
- The user says "just do it" or "don't ask, do it"
- The request is a single tool call (e.g. "show me today's tasks")
- You're already mid-execution and hit a recoverable error
