"use client";

import type { AgUiActionHandlers, AgUiCardDefinition, AgUiConversationTurn, AgUiRendererOverrides } from "../protocol";
import { mergeAgUiComponentRegistry } from "./registry";

type AgUiTurnRendererProps = {
  turn: AgUiConversationTurn;
  className?: string;
  components?: AgUiRendererOverrides;
  actionHandlers?: AgUiActionHandlers;
};

async function dispatchAgUiAction(
  actionHandlers: AgUiActionHandlers | undefined,
  turn: AgUiConversationTurn,
  card: AgUiCardDefinition,
  actionName: string,
  payload?: unknown,
) {
  if (!actionHandlers) {
    return;
  }

  const invocation = {
    actionId: turn.action.id,
    actionName,
    turn,
    card,
    payload,
  };

  const byActionAndName = actionHandlers.byActionAndName?.[`${turn.action.id}:${actionName}`];
  if (byActionAndName) {
    await byActionAndName(invocation);
    return;
  }

  const byName = actionHandlers.byName?.[actionName];
  if (byName) {
    await byName(invocation);
    return;
  }

  const byActionId = actionHandlers.byActionId?.[turn.action.id];
  if (byActionId) {
    await byActionId(invocation);
    return;
  }

  await actionHandlers.onAction?.(invocation);
}

/**
 * WHY:   Hosts need a single React boundary that can render server-produced AG UI turns with optional overrides and actions.
 * WHAT:  Maps a structured AG UI turn into the registered card components and injects per-card action context.
 * HOW:   Builds the merged component registry once per render, skips unknown cards safely, and dispatches host callbacks on demand.
 */
export default function AgUiTurnRenderer({
  turn,
  className,
  components,
  actionHandlers,
}: AgUiTurnRendererProps) {
  const registry = mergeAgUiComponentRegistry(components);
  const rootClassName = [
    "mt-3 flex w-full max-w-[760px] flex-col gap-3",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      {turn.cards.map((card) => {
        const Component = registry[card.componentId];
        if (!Component) {
          return null;
        }

        return (
          <Component
            key={card.id}
            {...card.props}
            agUiContext={{
              turn,
              card,
              actionHandlers,
              dispatchAction: (actionName, payload) =>
                dispatchAgUiAction(actionHandlers, turn, card, actionName, payload),
            }}
          />
        );
      })}
    </div>
  );
}
