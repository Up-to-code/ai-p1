# Public Auth Surface

Purpose: Defines the public authentication and organization-selection surfaces for Workspace.

This file documents layout rules for sign-in, sign-up, organization selection, and related public entry screens. It does not own Better Auth behavior, OAuth token policy, invitation validation, or organization authorization.

## Owned Screens

| Screen | Route | Primary action |
| --- | --- | --- |
| Sign in | `src/app/[locale]/(auth)/sign-in/page.tsx` | Start Google authentication. |
| Sign up | `src/app/[locale]/(auth)/sign-up/page.tsx` | Start Google authentication for account creation. |
| Choose organization | `src/app/[locale]/(auth)/choose-org/page.tsx` | Select, join, or create an organization. |
| Accept invite | `src/app/[locale]/(auth)/accept-invite/page.tsx` | Accept an organization invitation. |

## Layout Contract

- Desktop uses a two-column split.
- Mobile uses one column and hides the visual media panel.
- The form/action panel must be the reading-start panel for the active locale.
- Arabic desktop keeps the form panel on the right and the visual media panel on the left.
- English desktop keeps the form panel on the left and the visual media panel on the right.
- Brand marks, back buttons, and action buttons must not collide with the media panel edge.
- Top navigation controls must remain inside their owning panel, not visually float across the split boundary.

## Arabic Direction Rules

- Arabic page content uses RTL text flow.
- The back control still uses a leading chevron that points back in the visual direction.
- Mixed English product names inside Arabic copy should use `bdi` or explicit LTR direction when needed.
- Desktop brand placement in the media panel must mirror with the panel, not stay pinned to the global page edge.
- Do not force `dir="ltr"` on an Arabic layout container unless the content is a technical value, URL, token, or code-like string.

## Visual Panel Rules

- The visual panel may use video or image media.
- The media must stay decorative and non-interactive.
- Overlays must preserve text contrast in light and dark modes.
- Copy inside the visual panel must stay inside the panel bounds at desktop widths.
- Avoid debug-only live scripts, injected design-review helpers, or temporary tool comments in committed layout files.

## Organization Selection Rules

- Existing organizations are shown before join/create actions.
- Organization logos may come from dynamic upload hosts.
- Invite links and raw invite tokens must both route to invite acceptance.
- Create organization defaults to a valid organization type when the user does not choose one.
- Busy states must disable repeated organization selection, join, and create actions.

## Done Checklist

- [x] Documented the RTL desktop split rule shown by the screenshot.
- [x] Documented that Arabic form content starts on the right desktop panel.
- [x] Documented that media/brand content mirrors to the opposite panel.
- [x] Documented that committed files should not keep temporary layout comments or live-review scripts.

## Related Domains

- [UI Interface](interface.md)
- [Auth](../auth/index.md)
- [Security](../security/index.md)
- [Developer Experience](../developer-experience/index.md)
