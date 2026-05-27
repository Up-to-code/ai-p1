# Guidelines

Purpose: Defines how documentation is structured, named, written, referenced, and maintained.

## Scope

This folder owns small, focused documentation files for guidelines.

This folder does not own broad system-wide specification text. If content crosses domains, link to the owning domain.

## Files

| File | Purpose |
| --- | --- |
| [Documentation Structure](documentation-structure.md) | Docs are split by domain. |
| [File Naming](file-naming.md) | Use lowercase kebab-case. |
| [Index Files](index-files.md) | Every folder index lists purpose, scope, files, read order, related domains, and maintenance rules. |
| [Writing Style](writing-style.md) | Use direct technical language. |
| [Code Examples](code-examples.md) | Examples include file path and TypeScript where relevant. |
| [Diagrams](diagrams.md) | Use Mermaid or text diagrams for complex flow. |
| [References](references.md) | Use official sources for regulations and package docs. |
| [Maintenance](maintenance.md) | Split files over size limit. |

## Read Order

1. [Documentation Structure](documentation-structure.md)
2. [File Naming](file-naming.md)
3. [Index Files](index-files.md)
4. [Writing Style](writing-style.md)
5. [Code Examples](code-examples.md)
6. [Diagrams](diagrams.md)
7. [References](references.md)
8. [Maintenance](maintenance.md)

## Related Domains

- [Workspace Documentation](../README.md)
- [Documentation Standards](../../../../docs/engineering/documentation-standards.md)

## Maintenance Rules

- Update this index whenever a file changes name, scope, or ownership.
- Keep each file focused on one responsibility.
- Split any file that grows beyond documentation size policy.
