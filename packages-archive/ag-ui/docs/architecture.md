# AG UI Architecture

## Summary

`@qentrah/ag-ui` separates the AG UI contract from any single host app. The package owns the turn protocol, default card set, registry, and React renderer. Hosts own data fetching, mutations, transport, and side effects.

## Layers

- `src/protocol`
  Defines `AgUiConversationTurn`, card ids, action metadata, schemas, and the demo/reference `resolveAgUiTurn`.
- `src/cards`
  Ships the default ready-to-use card components.
- `src/react`
  Provides the renderer plus registry merge helpers and action dispatch plumbing.

## Rendering lifecycle

1. The host receives or builds an `AgUiConversationTurn`.
2. `AgUiTurnRenderer` walks `turn.cards` in order.
3. Each card resolves through the default registry plus any consumer overrides.
4. The renderer injects `agUiContext`, which includes `turn`, `card`, and `dispatchAction`.
5. Cards can trigger host-owned callbacks through `actionHandlers`.

## Registry model

- The default registry lives in `src/react/registry.ts`.
- Consumers can override only the card ids they care about.
- Unknown card ids fail safely and render nothing.

## Host responsibilities

The package stays host-neutral. Workspace-specific forms, uploads, routing, and contracts belong in the host app instead of this package.
