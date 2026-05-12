"use client";

import { cn } from "@/lib/utils";
import styles from "./ai-motion-logo.module.css";
import type { AIMotionSize, AIMotionState } from "./types";

const STATE_CLASSNAME: Record<AIMotionState, string> = {
  idle: styles.stateIdle,
  loading: styles.stateLoading,
  thinking: styles.stateThinking,
  searching: styles.stateSearching,
  success: styles.stateSuccess,
  tool: styles.stateTool,
  agent: styles.stateAgent,
  analyzing: styles.stateAnalyzing,
  syncing: styles.stateSyncing,
  focus: styles.stateFocus,
  quantum: styles.stateQuantum,
  matching: styles.stateMatching,
  shield: styles.stateShield,
  growth: styles.stateGrowth,
  glitch: styles.stateGlitch,
};

const SIZE_CLASSNAME: Record<AIMotionSize, string> = {
  compact: styles.sizeCompact,
  standard: styles.sizeStandard,
  hero: styles.sizeHero,
};

export default function AIMotionLogo({
  state = "idle",
  size = "standard",
  floating = false,
  mirrored = false,
  className,
}: {
  state?: AIMotionState;
  size?: AIMotionSize;
  floating?: boolean;
  mirrored?: boolean;
  className?: string;
}) {
  return (
    <div
      data-ai-motion-logo="true"
      data-ai-motion-state={state}
      data-ai-motion-size={size}
      className={cn(
        styles.root,
        SIZE_CLASSNAME[size],
        STATE_CLASSNAME[state],
        floating && styles.floating,
        mirrored && styles.mirrored,
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" className={styles.shieldRing} />

        <g className={cn(styles.bgPath, styles.basePath)}>
          <path d="M 100 160 L 100 55" />
          <path d="M 100 55 L 115 40" />
          <path d="M 100 85 L 85 70 L 85 45" />
          <path d="M 100 115 L 80 95 L 45 95" />
          <path d="M 100 115 L 120 95 L 120 65" />
          <path d="M 120 95 L 150 95" />
        </g>

        <g>
          <circle cx="115" cy="40" r="8.5" className={cn(styles.radarRing, styles.rTop)} />
          <circle cx="45" cy="95" r="8.5" className={cn(styles.radarRing, styles.rLeft)} />
          <circle cx="150" cy="95" r="8.5" className={cn(styles.radarRing, styles.rRight)} />
        </g>

        <g className={cn(styles.activePath, styles.basePath)}>
          <path className={styles.pathTrunk} d="M 100 160 L 100 55" />
          <path className={styles.pathTop} d="M 100 55 L 115 40" />
          <path className={styles.pathL2} d="M 100 85 L 85 70 L 85 45" />
          <path className={styles.pathL1} d="M 100 115 L 80 95 L 45 95" />
          <path className={styles.pathR1} d="M 100 115 L 120 95 L 120 65" />
          <path className={styles.pathR2} d="M 120 95 L 150 95" />
        </g>

        <g className={styles.nodes}>
          <circle cx="100" cy="160" r="8.5" className={cn(styles.node, styles.n1)} />
          <circle cx="45" cy="95" r="8.5" className={cn(styles.node, styles.n2)} />
          <circle cx="85" cy="45" r="8.5" className={cn(styles.node, styles.n3)} />
          <circle cx="115" cy="40" r="8.5" className={cn(styles.node, styles.n4)} />
          <circle cx="120" cy="65" r="8.5" className={cn(styles.node, styles.n5)} />
          <circle cx="150" cy="95" r="8.5" className={cn(styles.node, styles.n6)} />
          <circle cx="135" cy="125" r="8.5" className={cn(styles.node, styles.floatingNode)} />
        </g>
      </svg>
    </div>
  );
}
