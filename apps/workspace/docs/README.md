# Workspace Documentation

Purpose: Navigation entry point for the Qentrah Workspace documentation.

The workspace is a synchronization engine and OAuth 2.1 Provider. External CRMs, mobile apps, and partner platforms submit claims. The workspace validates, approves, computes visibility, and synchronizes authoritative state.

## Domain Indexes

| Domain | Purpose |
| --- | --- |
| [Architecture](architecture/index.md) | Defines the technical structure of the Qentrah Workspace as a synchronization engine. |
| [Auth](auth/index.md) | Defines Better Auth, OAuth 2.1 Provider behavior, Organization authorization, consent, scopes, and credentials. |
| [Synchronization](synchronization/index.md) | Defines how external claims become approved canonical state and how that state is synchronized outward. |
| [Visibility](visibility/index.md) | Defines how the workspace decides which property data is visible to each platform, audience, organization, and channel. |
| [UI](ui/index.md) | Defines Qentrah interface layout, tokenized design system, onboarding flow, pages, components, states, and synchronization UX. |
| [Sdk](sdk/index.md) | Defines the official developer SDK plan for OAuth, API access, token handling, and webhook verification. |
| [Security](security/index.md) | Defines threat controls, token safety, API protection, webhook safety, frontend safety, and secrets handling. |
| [Compliance](compliance/index.md) | Defines regulatory context for PDPL and auditability. |
| [Data Model](data-model/index.md) | Defines data shapes, table responsibilities, relationships, indexes, validators, and versioning rules. |
| [Developer Experience](developer-experience/index.md) | Defines how external developers register apps, test OAuth, configure webhooks, and integrate APIs. |
| [Guidelines](guidelines/index.md) | Defines how documentation is structured, named, written, referenced, and maintained. |

## Required Reading Order

1. [Guidelines](guidelines/index.md)
2. [Architecture](architecture/index.md)
3. [Frontend Architecture](architecture/frontend/index.md)
4. [UI](ui/index.md)
5. [Auth](auth/index.md)
6. [Synchronization](synchronization/index.md)
7. [Visibility](visibility/index.md)
8. [Security](security/index.md)
9. [Compliance](compliance/index.md)
10. [Data Model](data-model/index.md)
11. [Developer Experience](developer-experience/index.md)
12. [SDK](sdk/index.md)

## Maintenance Rules

- Every folder must have an index.md.
- Every Markdown file uses lowercase kebab-case.
- Keep docs small and focused.
- Link across domains instead of copying large sections.
- Do not modify partners/ from workspace documentation work.
