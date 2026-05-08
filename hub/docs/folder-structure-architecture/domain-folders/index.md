# Domain Folders

Purpose: Explains why the documentation is split into domain folders and how those folders should be used together.

## Scope

This folder owns the documentation architecture map for existing domains.

This folder does not replace the index files inside each domain.

## Files

| File | Purpose |
| --- | --- |
| `index.md` | Explains the existing documentation domains and how to use them together. |

## Why Domains Exist

The hub has many responsibilities: architecture, authentication, synchronization, visibility, security, compliance, data model, SDKs, developer experience, and UI. Keeping these in one document would make the system hard to review and easy to corrupt.

Domain folders keep ownership clear. Each folder answers one kind of question and links to other folders when a decision crosses boundaries.

## Domain Map

| Domain | Question It Answers |
| --- | --- |
| [Architecture](../../architecture/index.md) | How is the system structured? |
| [Auth](../../auth/index.md) | How do identity, OAuth, organizations, scopes, and credentials work? |
| [Synchronization](../../synchronization/index.md) | How do external claims become approved canonical state? |
| [Visibility](../../visibility/index.md) | Who can see which property data, and why? |
| [Security](../../security/index.md) | How are threats, tokens, APIs, webhooks, frontend surfaces, and secrets controlled? |
| [Compliance](../../compliance/index.md) | Which Saudi regulatory contexts affect product and data decisions? |
| [Data Model](../../data-model/index.md) | What data shapes, relationships, indexes, validators, and versioning rules exist? |
| [Developer Experience](../../developer-experience/index.md) | How do external developers register, test, and integrate? |
| [SDK](../../sdk/index.md) | How should official integration tooling be packaged and used? |
| [UI](../../ui/index.md) | How should the hub interface, onboarding, states, and design system behave? |
| [Guidelines](../../guidelines/index.md) | How should documentation be named, structured, maintained, and referenced? |
| [Legacy](../../legacy/index.md) | Where are old source documents preserved during migration? |

## How Domains Work Together

Domains should be connected by links, not duplicated text.

Example: a webhook delivery decision may touch:

- [Synchronization / Distribution](../../synchronization/distribution/index.md) for retry and delivery behavior;
- [Security / Webhook Security](../../security/webhook-security/index.md) for signatures and replay protection;
- [Developer Experience / Webhooks](../../developer-experience/webhooks/index.md) for partner setup;
- [Data Model / Audit](../../data-model/audit/index.md) for delivery records.

Each domain keeps its own detail. The folder architecture explains the relationship.

## When To Add A New Folder

Add a new folder only when:

- the topic has a durable responsibility;
- the topic cannot be cleanly owned by an existing folder;
- the folder can have a clear `index.md`;
- the folder does not duplicate another domain;
- the folder remains inside the hub product boundary.

## When Not To Add A New Folder

Do not add a new folder for:

- temporary notes;
- broad drafts;
- implementation experiments;
- duplicate summaries;
- CRM, marketplace, lead pipeline, or deal pipeline ideas;
- topics that already have an owning domain.

## Read With

- [Root Documentation](../../README.md)
- [Guidelines / Index Files](../../guidelines/index-files.md)
- [Guidelines / Maintenance](../../guidelines/maintenance.md)

## Maintenance Rules

- Keep this map current with root documentation.
- Do not make this folder the source of truth for domain details.
- Link to each owning domain.
- Keep new folder decisions conservative.
