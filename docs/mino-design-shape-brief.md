# Mino Design Foundations Shape Brief

## 1. Feature Summary

Mino Design foundations define the repo-wide design language for the Qentrah monorepo. The brief is for engineers and agents building product surfaces, public landing pages, partner flows, admin tools, and shared UI packages.

The primary audience is real estate operators: brokers, sales teams, coordinators, admins, and organization owners. The system should make every surface feel calm, precise, premium, and operationally clear.

## 2. Primary User Action

The user should immediately understand the most important state and next useful action on any Mino surface.

For product screens, that means priority, ownership, risk, and action are visible without hunting. For brand surfaces, that means the public story still points back to real workspace value.

## 3. Design Direction

**Color strategy:** Restrained by default for product surfaces, with committed atmospheric moments reserved for public landing and product-preview sections.

**Theme scene sentence:** A real estate operations lead is reviewing client follow-ups, listing readiness, and approval risks during a busy workday on a laptop in a bright office, with quick mobile checks between meetings. This pushes the product default toward light, calm, highly legible surfaces, with dark cinematic surfaces reserved for public storytelling and previews.

**Anchor references:**

- Current workspace landing page: aurora atmosphere, large confident type, product-preview storytelling, restrained copy, and clear CTAs.
- Linear: calm operational density, confident hierarchy, quiet chrome, and fast task orientation.
- Stripe: platform trust, polished public surfaces, precise copy, and high-quality technical credibility.

**Per-surface overrides:** Product dashboards, forms, tables, OAuth consent, and admin tools stay product register. Public landing, marketing, docs, and partner trust pages may use brand register when persuasion or storytelling is the core job.

**Visual direction probe:** Skipped because this run establishes design foundations from existing repo evidence and already-selected anchors, not a net-new screen implementation.

## 4. Scope

**Fidelity:** Production-ready design system foundations.

**Breadth:** Whole repo design language, including workspace, marketing/public routes, partner platform, admin review, demo partner app, and shared UI packages.

**Interactivity:** Documentation and implementation guidance, not a shipped interactive component in this step.

**Time intent:** Create a stable foundation now, then use it to guide later implementation, audit, polish, and extraction work.

## 5. Layout Strategy

Product surfaces should use dense but breathable layouts: stable sidebars or topbars, clear page headers, compact controls, readable tables, and panels that earn their space. Hierarchy should come from grouping, alignment, state, and contrast rather than nested cards or heavy shadows.

Brand surfaces can use larger scale and cinematic section rhythm, but the first viewport should show the actual product, workspace state, or concrete operating value. Public pages should reveal enough of the next section to establish continuity beyond the hero.

Shared components should prefer stable dimensions, predictable spacing, and RTL-aware composition. The same layout should not merely mirror into Arabic; line-height, wrapping, icon direction, and scan order need explicit checks.

## 6. Key States

- **Default:** Clear current state, primary action, and relevant operational context.
- **Empty:** Explain what is missing, why it matters, and the next useful action.
- **Loading:** Show stable skeletons or progress states that preserve layout and avoid jumpy transitions.
- **Error:** State what failed, what the user can do, and whether data is safe.
- **Success:** Confirm completion without stealing attention from the next task.
- **Pending or review:** Use amber or draft semantics only when there is real operational uncertainty.
- **Blocked or risk:** Use danger semantics with text and recovery path, not color alone.
- **RTL and long text:** Preserve readable wrapping, spacing, and control affordances.
- **Mobile:** Keep primary work reachable with touch-safe controls and no hidden hover-only interactions.
- **Reduced motion:** Preserve meaning when animation is disabled.

## 7. Interaction Model

Interactions should feel fast, quiet, and explicit. Buttons, chips, filters, tabs, and menus must provide visible hover, active, disabled, and focus-visible states.

Product flows should avoid modal-first design. Prefer inline editing, progressive disclosure, route-level pages, or side panels when they better preserve context.

Motion should clarify hierarchy, confirm state, or reveal continuity. Use easing that feels composed and avoid bounce, elastic, or layout-property animation.

## 8. Content Requirements

Copy should be direct, operational, and specific. Labels should name the action or state, not describe the interface.

Every empty, loading, error, success, blocked, and pending state needs copy. Arabic and English copy should be treated as parallel product writing, not literal string substitution.

Default examples and demos should use realistic real estate content: clients, properties, units, viewings, approvals, partner apps, organizations, integrations, inventory readiness, and calendar work.

## 9. Recommended References

- `.agents/skills/impeccable/reference/product.md` for product-register discipline.
- `.agents/skills/impeccable/reference/brand.md` for public landing and marketing exceptions.
- `.agents/skills/impeccable/reference/spatial-design.md` for density, hierarchy, grouping, and rhythm.
- `.agents/skills/impeccable/reference/typography.md` for English and Arabic type hierarchy.
- `.agents/skills/impeccable/reference/color-and-contrast.md` for restrained product color and semantic states.
- `.agents/skills/impeccable/reference/interaction-design.md` for forms, focus, loading, and feedback.
- `.agents/skills/impeccable/reference/responsive-design.md` for mobile and RTL behavior.
- `.agents/skills/impeccable/reference/ux-writing.md` for concise product copy.

## 10. Open Questions

The brief is ready for user confirmation before any broad implementation or redesign work begins.

Future implementation work should decide which concrete surface to improve first: workspace landing, app shell, dashboard, admin review, partner portal, OAuth consent, or shared UI package extraction.
