"use client";

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import Sortable from "sortablejs";

export interface UseSortableBoardOptions {
  stages: Array<{ key: string }>;
  draggable: boolean;
  onCardMove?: (
    itemId: string,
    fromStage: string,
    toStage: string,
    targetIndex: number,
  ) => void;
  itemSelector?: string;
  handleSelector?: string;
}

export interface UseSortableBoardResult {
  getColumnRef: (key: string) => (el: HTMLDivElement | null) => void;
  columnRefs: MutableRefObject<Map<string, HTMLDivElement | null>>;
}

const SORTABLE_STYLE_ID = "pipeline-board-sortable-styles";

const SORTABLE_CSS = `
  .sortable-ghost { opacity: 0.4; background: transparent; }
  .sortable-drag { opacity: 0.8; transform: scale(0.97); }
  .sortable-chosen { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
`;

export function useSortableBoard({
  stages,
  draggable,
  onCardMove,
  itemSelector = "[data-card-id]",
  handleSelector,
}: UseSortableBoardOptions): UseSortableBoardResult {
  const columnRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const onCardMoveRef = useRef(onCardMove);
  onCardMoveRef.current = onCardMove;
  // Consumers commonly derive `stages` during render. Depending on that array
  // identity tears down Sortable while it is finishing `_onDrop`, leaving its
  // internal element null and causing `removeEventListener` to throw. Only the
  // ordered keys determine which Sortable instances need to exist.
  const stageKeys = stages.map((stage) => stage.key).join("\u0000");

  const getColumnRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      columnRefs.current.set(key, el);
    },
    [],
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.id = SORTABLE_STYLE_ID;
    style.textContent = SORTABLE_CSS;
    document.head.appendChild(style);

    if (!draggable) return () => style.remove();
    const sortables: Sortable[] = [];

    const keys = stageKeys ? stageKeys.split("\u0000") : [];
    keys.forEach((stageKey) => {
      const el = columnRefs.current.get(stageKey);
      if (!el) return;

      const sortable = Sortable.create(el, {
        group: "pipeline-board",
        animation: 150,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        chosenClass: "sortable-chosen",
        dataIdAttr: "data-card-id",
        draggable: itemSelector,
        handle: handleSelector,
        filter: "button,input,textarea,select,[data-board-property]",
        preventOnFilter: false,
        onEnd: (evt) => {
          const itemId = evt.item.getAttribute("data-card-id");
          if (!itemId) return;

          const fromStage = evt.from.getAttribute("data-stage-key");
          const toStage = evt.to.getAttribute("data-stage-key");

          // CRITICAL: Revert the SortableJS DOM move BEFORE React re-renders.
          // SortableJS physically moved the node; React's virtual DOM still
          // expects it in the original parent. Putting it back prevents the
          // "removeChild: node is not a child of this node" crash.
          if (fromStage !== toStage) {
            const originalParent = evt.from;
            const siblings = Array.from(originalParent.children);
            const oldIndex = evt.oldIndex ?? 0;
            const refNode = siblings[oldIndex] ?? null;
            originalParent.insertBefore(evt.item, refNode);
          } else {
            const parent = evt.from;
            const siblings = Array.from(parent.children);
            const oldIndex = evt.oldIndex ?? 0;
            const refNode = siblings[oldIndex] ?? null;
            parent.insertBefore(evt.item, refNode);
          }

          if (fromStage && toStage) {
            queueMicrotask(() => {
              onCardMoveRef.current?.(
                itemId,
                fromStage,
                toStage,
                evt.newIndex ?? 0,
              );
            });
          }
        },
      });

      sortables.push(sortable);
    });

    return () => {
      sortables.forEach((s) => s.destroy());
      style.remove();
    };
  }, [draggable, handleSelector, itemSelector, stageKeys]);

  return { getColumnRef, columnRefs };
}
