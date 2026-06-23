"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Wraps page content in a smooth fade + transform transition on route change.
 *
 * Uses framer-motion's AnimatePresence with `mode="wait"` so the old page
 * completes its exit animation before the new page enters.
 *
 * Customization:
 *   Duration  → change `duration` in the `transition` object
 *   Easing     → change `ease` (project convention: [0.22, 1, 0.36, 1])
 *   Offset     → change `y` values in variants
 *   Scale      → change `scale` values in variants
 *   Blur       → add `filter: blur(Npx)` to initial/exit for a frosted feel
 *
 * This component must be placed inside a layout that persists across
 * routes (not a template) so that AnimatePresence can keep the old
 * children mounted during the exit animation.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="flex min-h-0 flex-1 flex-col"
        initial={{ opacity: 0, y: 6, scale: 0.997 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -3, scale: 0.997 }}
        transition={{
          duration: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
