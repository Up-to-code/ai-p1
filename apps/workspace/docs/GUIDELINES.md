# Documentation Guidelines

Purpose: Master documentation rules for the granular workspace documentation system.

## Mandatory Structure

- Documentation is organized by domain folders under workspace/docs.
- Every folder must contain index.md.
- Every major topic gets a focused file.
- No new giant root-level specification file is allowed.

## Naming

- Use lowercase kebab-case for all new Markdown files.
- Use index.md for folder navigation.
- Use direct names that state the topic.
- Do not use misc.md, notes.md, final.md, draft.md, or version suffixes.

## File Size

- Target 150-300 lines per focused file.
- Review files over 300 lines for splitting.
- Split files over 500 lines unless explicitly approved as an archive.
- Root README and GUIDELINES must stay navigational.

## Required Index Contents

Each index.md must include:

- Purpose.
- Scope.
- File list.
- Read order.
- Related domains.
- Maintenance rules.

## Writing Rules

- Use direct technical language.
- Use must and must not for mandatory rules.
- Mark examples as examples.
- Mark technical compliance interpretation as non-legal advice.
- Cite official sources for Saudi regulatory claims.
- Do not add CRM, marketplace, lead pipeline, or deal pipeline scope.

## Code Example Rules

- Include file path before code snippets.
- Prefer TypeScript.
- Use Zod for payload validation examples.
- Never include real secrets, tokens, API keys, or personal data.
- Never show browser storage of client secrets.

## Domain Ownership

- architecture owns system structure.
- auth owns Better Auth, OAuth 2.1, Organization plugin, scopes, credentials.
- synchronization owns claims, approval, canonical state, distribution.
- visibility owns computed visibility and suppression.
- sdk owns @anand/sdk plans and examples.
- security owns threat controls.
- compliance owns Saudi regulatory context.
- data-model owns schema and table documentation.
- developer-experience owns external developer workflows.
- guidelines owns documentation policy.

## Maintenance Rule

When behavior changes, update the smallest owning doc and its folder index in the same change.

## Root Folder Rule

Only these Markdown files are allowed directly under `workspace/docs/`:

- `README.md`
- `GUIDELINES.md`

All other Markdown files must live inside a domain folder with an `index.md`.
