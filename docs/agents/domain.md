# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root.
- **`docs/decisions/`** for architectural decisions and ownership decisions that touch the area you're about to work in.
- **`CONTEXT-MAP.md`** at the repo root if it is added later. If it exists, treat this as a multi-context repo and read each context file relevant to the topic.

If any of these files don't exist, proceed silently. Don't flag their absence and don't suggest creating them upfront.

## File structure

This repo currently uses a single-context layout:

```text
/
├── CONTEXT.md
├── docs/
│   └── decisions/
│       ├── partners-owns-partner-app-catalog-and-review.md
│       └── workspace-owns-organization-grants-and-oauth-runtime-projection.md
└── apps/
```

If `CONTEXT-MAP.md` is added later, use it to find per-context `CONTEXT.md` files and check for context-scoped decision docs near the code you are changing.

## Use the glossary's vocabulary

When your output names a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, either reconsider whether you are inventing language the project doesn't use or note the gap for a domain-doc update.

## Flag decision conflicts

If your output contradicts an existing decision doc, surface it explicitly rather than silently overriding it.
