"use client";

import { motion, useReducedMotion } from "framer-motion";

export type SignalLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  duration?: number;
  delay?: number;
};

const CHART_POINTS = [
  { x: 160, y: 210 },
  { x: 220, y: 180 },
  { x: 280, y: 140 },
  { x: 340, y: 115 },
] as const;

function AnimatedChartPath({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.path
      d="M 160 210 L 220 180 L 280 140 L 340 115"
      fill="none"
      stroke="#60A5FA"
      strokeWidth="2.5"
      strokeLinecap="round"
      initial={{ opacity: 0.18, pathLength: 0.6 }}
      animate={reduceMotion ? undefined : { opacity: [0.18, 0.42, 0.18], pathLength: [0.6, 1, 0.6] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function AnimatedChartPoints({ reduceMotion }: { reduceMotion: boolean | null }) {
  return CHART_POINTS.map((point, index) => (
    <motion.circle
      key={`${point.x}-${point.y}`}
      cx={point.x}
      cy={point.y}
      r="5"
      fill="#60A5FA"
      initial={{ opacity: 0.24, scale: 1 }}
      animate={reduceMotion ? undefined : { opacity: [0.24, 0.7, 0.24], scale: [1, 1.18, 1] }}
      transition={{ duration: 2.4, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" }}
    />
  ));
}

function AnimatedChartTracker({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.circle
      r="4.5"
      fill="#FFFFFF"
      stroke="#2563EB"
      strokeWidth="2"
      initial={{ opacity: 0 }}
      animate={
        reduceMotion
          ? undefined
          : {
              cx: CHART_POINTS.map((point) => point.x),
              cy: CHART_POINTS.map((point) => point.y),
              opacity: [0, 1, 1, 0],
            }
      }
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function ConnectionOverlay({
  lines,
  viewBoxWidth,
  viewBoxHeight,
}: {
  lines: SignalLine[];
  viewBoxWidth: number;
  viewBoxHeight: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      {lines.map((line, index) => {
        const transition = { duration: line.duration ?? 3.6, delay: line.delay ?? index * 0.16, repeat: Infinity, ease: "easeInOut" as const };
        const movingDot = reduceMotion ? undefined : { cx: [line.x1, line.x2], cy: [line.y1, line.y2], opacity: [0, 1, 0] };
        return (
          <g key={`${line.x1}-${line.y1}-${index}`}>
            <motion.line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={line.color} strokeWidth="2" strokeLinecap="round" initial={{ opacity: 0.16 }} animate={reduceMotion ? undefined : { opacity: [0.16, 0.42, 0.16] }} transition={transition} />
            <motion.circle r="4" fill={line.color} stroke="white" strokeWidth="1.5" initial={{ opacity: 0 }} animate={movingDot} transition={transition} />
          </g>
        );
      })}
    </svg>
  );
}

export function ChartOverlay() {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 520 420" className="h-full w-full" aria-hidden="true">
      <AnimatedChartPath reduceMotion={reduceMotion} />
      <AnimatedChartPoints reduceMotion={reduceMotion} />
      <AnimatedChartTracker reduceMotion={reduceMotion} />
    </svg>
  );
}
