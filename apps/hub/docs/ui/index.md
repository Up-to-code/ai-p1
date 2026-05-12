# UI

Purpose: Defines the Anand user interface documentation domain for layout, onboarding, design tokens, page behavior, and reusable ShadCN/UI component rules.

## Scope

This folder owns UI interface specifications for the Anand synchronization hub.

This folder does not own backend authorization, Convex schema, synchronization policy, visibility policy, SDK contracts, Saudi compliance interpretation, or developer onboarding flows. Those subjects stay in their owning domains and are linked when needed.

## Files

| File | Purpose |
| --- | --- |
| [Interface](interface.md) | Defines the complete Anand UI interface, tokenized design system, onboarding flow, sidebar layout, major pages, components, states, and synchronization UX. |

## Read Order

1. [Interface](interface.md)

## Related Domains

- [Architecture](../architecture/index.md)
- [Frontend Architecture](../architecture/frontend/index.md)
- [Auth](../auth/index.md)
- [Synchronization](../synchronization/index.md)
- [Visibility](../visibility/index.md)
- [Security](../security/index.md)
- [Guidelines](../guidelines/index.md)

## Maintenance Rules

- Update this index whenever a UI documentation file is added, renamed, removed, or split.
- Keep UI files focused on interface behavior, page states, component composition, and design token usage.
- Do not place backend policy decisions in UI documents.
- Do not create custom primitive components when ShadCN/UI provides an official primitive.
- Preserve the token-driven design rule: no page-specific hardcoded colors, radius, spacing, shadows, typography, component heights, or sidebar widths.
