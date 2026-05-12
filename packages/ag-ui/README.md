# `@anan/ag-ui`

Reusable AG UI package for rendering structured agent turns as ready-made UI cards.

## What it includes

- Protocol types and schemas for `AgUiConversationTurn`
- Default cards for drafts, updates, missing-data prompts, market insights, and approval flows
- React renderer with registry overrides and host-owned action callbacks
- Anan adapter entrypoint for the current property form, rich text editor, and delete confirmation modal

## Entry points

```ts
import type { AgUiConversationTurn } from "@anan/ag-ui";
import { resolveAgUiTurn } from "@anan/ag-ui";
import { AgUiTurnRenderer } from "@anan/ag-ui/react";
import { AgPropertyForm } from "@anan/ag-ui/anan";
```

## First render

```tsx
import { AgUiTurnRenderer } from "@anan/ag-ui/react";
import type { AgUiConversationTurn } from "@anan/ag-ui";

export function AssistantSurface({ turn }: { turn: AgUiConversationTurn }) {
  return <AgUiTurnRenderer turn={turn} />;
}
```

## Action callbacks

```tsx
<AgUiTurnRenderer
  turn={turn}
  actionHandlers={{
    byName: {
      approve: async ({ actionId, turn }) => {
        console.log("approved", actionId, turn.objective);
      },
      edit: ({ actionId }) => {
        console.log("request edit", actionId);
      },
    },
  }}
/>
```

## Registry overrides

```tsx
import { AgUiTurnRenderer } from "@anan/ag-ui/react";

function CustomLatestUpdateCard(props: Record<string, unknown>) {
  return <div data-card="custom-latest-update">{String(props["entity"])}</div>;
}

<AgUiTurnRenderer
  turn={turn}
  components={{
    latest_update: CustomLatestUpdateCard,
  }}
/>
```

## Docs

- `docs/architecture.md`
- `docs/integration.md`
- `docs/api.md`
