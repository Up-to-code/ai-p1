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

const QENTRAH_LOGO_PATH =
  "M440.297 0.905524C425.029 4.13673 418.981 6.877 406.785 16.089C402.901 19.0228 395.601 23.9123 390.562 26.9545C378.396 34.2997 376.556 35.4395 374.928 36.6393C374.168 37.1986 367.363 41.5464 359.805 46.3012C352.246 51.056 343.117 56.8403 339.518 59.1553C335.919 61.4703 330.124 65.0735 326.641 67.1624C323.159 69.2513 318.952 71.8439 317.294 72.9237C314.587 74.6861 302.835 81.9602 297.197 85.3635C278.532 96.6297 271.304 106.042 267.526 124.002C264.799 136.967 264.679 354.786 267.393 366.129C271.214 382.102 275.18 386.384 297.636 398.791C309.52 405.356 310.301 405.812 316.261 409.65C319.306 411.611 322.125 413.216 322.526 413.216C322.927 413.216 334.769 420.01 348.842 428.313C378.899 446.048 385.125 448.266 395.216 444.836C403.862 441.897 409.896 435.875 412.608 427.478C414.553 421.455 414.775 409.717 414.775 312.889C414.775 205.965 414.799 204.962 417.517 199.635C424.702 185.55 437.916 177.281 453.483 177.129C462.364 177.042 463.245 177.327 475.078 184.116C481.863 188.009 487.709 191.541 488.069 191.964C488.429 192.387 490.195 193.489 491.995 194.411C493.795 195.334 497.623 197.374 500.502 198.945C507.613 202.824 520.628 202.915 527.988 199.136C535.453 195.303 539.662 192.818 540.448 191.781C540.822 191.286 542.589 190.248 544.374 189.474C546.159 188.7 549.681 186.846 552.201 185.353C554.72 183.861 561.493 179.921 567.252 176.598C573.011 173.275 578.019 170.233 578.381 169.839C578.995 169.169 585.593 165.484 594.736 160.703C596.895 159.575 598.956 158.328 599.317 157.934C600.058 157.123 608.002 152.541 619.605 146.234C636.044 137.297 641.564 127.505 639.167 111.527C637.65 101.407 632.341 96.04 610.401 82.448C599.627 75.7726 589.927 69.9195 588.847 69.441C587.768 68.9625 583.939 66.7458 580.34 64.515C576.741 62.2842 572.618 59.755 571.178 58.8945C565.822 55.6931 547.923 44.7072 544.559 42.5567C542.643 41.3316 539.785 39.5647 538.208 38.6303C536.631 37.6958 530.541 33.9864 524.674 30.3872C518.808 26.7879 512.147 22.7557 509.873 21.4267C507.598 20.0977 502.707 17.2414 498.854 15.1172C490.618 10.6027 486.422 8.1305 476.801 4.38462C469.866 1.71475 463.402 0.641481 454.289 0.127594C449.305 -0.153773 443.63 0.288064 440.297 0.905524Z";

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
      <svg viewBox="0 0 901 1033" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <path
          className={styles.logoPath}
          fillRule="evenodd"
          clipRule="evenodd"
          d={QENTRAH_LOGO_PATH}
        />
      </svg>
    </div>
  );
}
