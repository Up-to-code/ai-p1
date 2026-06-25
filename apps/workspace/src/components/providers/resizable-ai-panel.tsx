"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AiPanel } from "@/components/layout/ai-panel";

const AI_PANEL_MIN = 320;
const AI_PANEL_MAX = 560;
const AI_PANEL_DEFAULT = 400;

export function ResizableAiPanel() {
  const [width, setWidth] = useState(AI_PANEL_DEFAULT);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const cleanupDragState = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  // Ensure cleanup on unmount to prevent leaked styles
  useEffect(() => cleanupDragState, [cleanupDragState]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const delta = startX.current - e.clientX;
    const next = Math.min(AI_PANEL_MAX, Math.max(AI_PANEL_MIN, startWidth.current + delta));
    setWidth(next);
  }, []);

  const onPointerUp = useCallback(() => {
    cleanupDragState();
  }, [cleanupDragState]);

  const onLostPointerCapture = useCallback(() => {
    // If pointer capture is lost (e.g. due to unmount), ensure drag state is cleaned
    if (isDragging.current) {
      cleanupDragState();
    }
  }, [cleanupDragState]);

  return (
    <div className="relative flex h-full shrink-0" style={{ width }}>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onLostPointerCapture={onLostPointerCapture}
        className="absolute left-0 top-0 z-20 flex h-full w-2 -translate-x-1 cursor-col-resize items-center justify-center"
      >
        <div className="h-8 w-0.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/50" />
      </div>
      <div className="flex h-full min-w-0 flex-1 overflow-hidden pl-1">
        <AiPanel />
      </div>
    </div>
  );
}