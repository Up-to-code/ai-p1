"use client";

import type React from "react";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface AuroraShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Aurora wave speed
   * @default 1.0
   */
  speed?: number;

  /**
   * Light intensity and brightness
   * @default 1.0
   */
  intensity?: number;

  /**
   * Color vibrancy and saturation
   * @default 1.0
   */
  vibrancy?: number;

  /**
   * Wave frequency and complexity
   * @default 1.0
   */
  frequency?: number;

  /**
   * Vertical stretch of aurora bands
   * @default 1.0
   */
  stretch?: number;
}

export const AuroraShaders = forwardRef<HTMLDivElement, AuroraShadersProps>(
  (
    {
      className,
      speed = 1,
      intensity = 1,
      vibrancy = 1,
      frequency = 1,
      stretch = 1,
      style,
      ...props
    },
    ref,
  ) => {
    const duration = `${Math.max(10, 30 / Math.max(speed, 0.2)).toFixed(2)}s`;
    const auroraStyle = {
      "--aurora-duration": duration,
      "--aurora-intensity": intensity,
      "--aurora-vibrancy": vibrancy,
      "--aurora-frequency": frequency,
      "--aurora-stretch": stretch,
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_64%)]",
          className,
        )}
        style={auroraStyle}
        {...props}
      >
        <div
          aria-hidden="true"
          className="absolute inset-[-34%] animate-[aurora-drift_var(--aurora-duration)_ease-in-out_infinite_alternate] bg-[linear-gradient(115deg,transparent_8%,color-mix(in_srgb,var(--color-primary)_62%,transparent)_22%,transparent_40%,color-mix(in_srgb,#14b8a6_48%,transparent)_56%,transparent_78%)] opacity-[calc(var(--aurora-intensity)*0.58)] blur-3xl saturate-[calc(var(--aurora-vibrancy)*1.35)] mix-blend-multiply motion-reduce:animate-none dark:mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-[-28%] animate-[aurora-wave_calc(var(--aurora-duration)*1.25)_ease-in-out_infinite_alternate] bg-[linear-gradient(68deg,transparent_10%,color-mix(in_srgb,#60a5fa_52%,transparent)_30%,transparent_48%,color-mix(in_srgb,var(--color-primary)_42%,transparent)_66%,transparent_88%)] opacity-[calc(var(--aurora-intensity)*0.42)] blur-2xl saturate-[calc(var(--aurora-vibrancy)*1.2)] mix-blend-multiply motion-reduce:animate-none dark:mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-[-10%] top-[8%] h-1/2 animate-[aurora-pulse_calc(var(--aurora-duration)*0.72)_ease-in-out_infinite] rounded-[999px] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-primary)_38%,transparent),transparent_68%)] opacity-[calc(var(--aurora-intensity)*0.55)] blur-3xl motion-reduce:animate-none"
        />
      </div>
    );
  },
);

AuroraShaders.displayName = "AuroraShaders";

export default AuroraShaders;
