---
name: Mino Design
description: Calm, precise, premium design language for the Qentrah real estate operating workspace.
colors:
  primary: "#0B5CFF"
  primary-hover: "#084AD6"
  primary-press: "#063DAF"
  background: "#F7F9FC"
  surface: "#FFFFFF"
  border: "#E4EAF2"
  text-primary: "#0E1726"
  text-secondary: "#4F5B6B"
  text-muted: "#7B8794"
  success: "#22C55E"
  warning: "#F59E0B"
  danger: "#EF4444"
  draft: "#2D8CFF"
  dark-background: "#0A0A0A"
  dark-surface: "#111111"
  dark-border: "#27272A"
  dark-text-primary: "#F4F4F5"
  dark-text-secondary: "#A1A1AA"
  dark-text-muted: "#71717A"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "0"
  headline:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  control-sm: "10px"
  control: "14px"
  card: "18px"
  modal: "24px"
  container: "24px"
  pill: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
  "16": "64px"
  "20": "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 24px"
  button-landing-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 40px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    height: "44px"
---

# Design System: Mino Design

## 1. Overview

**Creative North Star: "The Operating Desk"**

Mino Design should feel like a composed real estate operating desk: clear status, reliable hierarchy, premium restraint, and enough atmospheric polish to make complex work feel under control. The current workspace landing page sets the tone with a dark-to-light operational contrast, aurora atmosphere, strong type, pill actions, and product-preview storytelling.

The system is product-first. Dashboards, tables, forms, OAuth consent, and admin flows should be quieter than brand surfaces, with emphasis placed on priority, state, and action. Public landing pages may use larger scale, stronger atmosphere, and more cinematic sequencing, but they should still inherit the same disciplined visual language.

**Key Characteristics:**

- Calm operational hierarchy with a clear next action.
- Premium restraint, using atmosphere sparingly instead of decoration everywhere.
- Arabic and English parity, including RTL rhythm and Cairo support.
- Dense product UI that remains readable under real operational data.
- Brand moments that feel authored, not generic SaaS or stock Material.

## 2. Colors

The current palette is a cool operational blue system balanced by zinc neutrals, white surfaces, and functional success, warning, danger, and draft states.

### Primary

- **Command Blue** (`#0B5CFF`): Primary product accent for focus, key actions, active states, and controlled brand energy.
- **Pressed Blue** (`#063DAF`): Used for active or pressed primary states where the interface needs stronger response.

### Secondary

- **Signal Emerald** (`#22C55E`): Success, completion, positive operational status, and selected good-state feedback.
- **Review Amber** (`#F59E0B`): Pending, needs review, attention, and time-sensitive operational states.
- **Risk Red** (`#EF4444`): Destructive action, blocked state, failed validation, or critical risk.

### Neutral

- **Workspace Mist** (`#F7F9FC`): Main light background for product surfaces.
- **Panel White** (`#FFFFFF`): Primary surface color in the existing token set.
- **Line Bluegray** (`#E4EAF2`): Borders, dividers, and structural separation.
- **Ink Navy** (`#0E1726`): Main text and strong product emphasis.
- **Slate Copy** (`#4F5B6B`): Secondary text, descriptions, and supporting copy.
- **Muted Steel** (`#7B8794`): Metadata, placeholders, quiet labels, and secondary chrome.
- **Night Workspace** (`#0A0A0A`): Current dark background for high-contrast brand and preview surfaces.

### Named Rules

**The Accent Rarity Rule.** Product screens should use Command Blue sparingly enough that action and selection remain obvious. Brand surfaces can use larger atmospheric blue fields when storytelling needs it.

**The State Honesty Rule.** Success, warning, danger, and draft colors should map to real operational meaning. Do not use semantic colors as decoration.

## 3. Typography

**Display Font:** Geist Sans with system fallback.
**Body Font:** Geist Sans with system fallback.
**Arabic Font:** Cairo with Geist Sans and system fallback.

**Character:** The type system is compact, direct, and operational. English should feel precise and low-friction; Arabic should feel native, spacious enough for legibility, and never compressed to match English proportions.

### Hierarchy

- **Display** (700, `clamp(2.5rem, 8vw, 5.5rem)`, tight line-height): Landing heroes and major public positioning.
- **Headline** (700, `28px`, comfortable line-height): Product page headers and major workspace sections.
- **Title** (700, `22px`, compact line-height): Section titles, cards, dialogs, and panels.
- **Body** (500, `14px`, `1.6` line-height): Main operational copy, form help, table support text, and descriptions. Keep long-form body content near 65 to 75 characters per line.
- **Label** (700, `12px`, uppercase only when useful): Navigation, chips, metadata, field labels, and status headings.

### Named Rules

**The RTL Native Rule.** Arabic typography may use looser line-height and different wrapping than English. Preserve meaning and scan rhythm over visual mirroring.

**The No Decorative Gradient Type Rule.** Use weight, scale, rhythm, and color to create emphasis. Do not use gradient text.

## 4. Elevation

The current product token set is intentionally flat: `--shadow-card`, `--shadow-popover`, and `--shadow-modal` are all `none`. Depth is conveyed through borders, tonal layering, contrast, spacing, and occasional brand-surface atmosphere. Some landing components still use larger shadow utilities for cinematic emphasis, but that should not become the product default.

### Shadow Vocabulary

- **Flat Product Surface** (`box-shadow: none`): Default for product cards, panels, inputs, tables, and app chrome.
- **Brand Atmospheric Lift** (`box-shadow: 0 30px 120px rgba(15,23,42,0.08)` or similar): Reserved for public visuals and large narrative panels when a surface needs cinematic depth.
- **Preview Glow** (`box-shadow: 0 40px 120px rgba(120,140,255,0.18)`): Reserved for dark product-preview compositions, not standard cards.

### Named Rules

**The Flat By Default Rule.** Product UI should not rely on shadows to explain hierarchy. Use layout, border, tone, and content priority first.

## 5. Components

Components should feel precise, compact, and durable. They should expose status and next action without turning every item into a large decorative card.

### Buttons

- **Shape:** Existing controls use 14px radius; landing CTAs often use pill radius.
- **Primary:** Product primary uses Command Blue or strong Ink Navy depending on surface; landing primary uses dark ink on light surfaces or white on dark surfaces.
- **Hover / Focus:** Hover should darken or lift tone slightly. Focus must remain visible and accessible, using the configured ring color.
- **Secondary:** Secondary buttons use borders and quiet surfaces. They should not compete with the primary action.

### Chips

- **Style:** Status chips use low-opacity semantic backgrounds with stronger text color.
- **State:** Selected and urgent states should be readable in both themes and should retain meaning without color alone.

### Cards / Containers

- **Corner Style:** Product cards currently use 18px radius; public panels may use larger radii up to 24px or custom rounded narrative containers.
- **Background:** Product surfaces use Panel White or dark-surface equivalents; brand previews may use black or near-black panels.
- **Shadow Strategy:** Flat by default in product UI, atmospheric only for public or preview moments.
- **Border:** Use Line Bluegray or dark borders to define structure.
- **Internal Padding:** Use the 4px spacing scale, with 16px to 24px as the product default and larger spacing for landing sections.

### Inputs / Fields

- **Style:** 44px height, 14px radius, border from the shared border token, surface background.
- **Focus:** Ring should be visible, calm, and tied to Command Blue.
- **Error / Disabled:** Error states must include message text and not rely on red alone. Disabled states should preserve readable labels.

### Navigation

- **Style:** Product navigation should prioritize scan speed, stable dimensions, and clear current-location state.
- **Landing Navigation:** Public navigation can be lighter and more brand-led, but it should not hide the primary workspace action.
- **RTL:** Icon direction, text alignment, and navigation order need explicit RTL checks.

### Landing Surfaces

- **Style:** The workspace landing reference uses aurora atmosphere, large type, restrained copy, and product-preview hints.
- **Rule:** The public surface can be more cinematic than dashboards, but it must still show real product value and avoid generic hero templates.

## 6. Do's and Don'ts

Do use Mino Design to make operational priority obvious.

Do preserve Arabic and English parity, including Cairo typography, RTL layout checks, and long text behavior.

Do use Command Blue as a strategic product accent, not as a blanket wash over every surface.

Do keep product surfaces flat, structured, and readable under real data.

Do let public landing pages use atmosphere, motion, and scale when they support trust and product comprehension.

Do not make the repo feel like stock Google Material Design.

Do not use gradient text, side-stripe borders, nested cards, generic icon-card grids, decorative glassmorphism, or hero metric templates.

Do not use luxury real estate cliches such as black-and-gold prestige styling, marble motifs, or brochure-like glamour unless the product context explicitly demands it.

Do not design only for English. Arabic layout and copy density must influence spacing, line-height, and component behavior.

Do not use motion as decoration. Motion should reveal hierarchy, confirm state, or help users understand flow.
