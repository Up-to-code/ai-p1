import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string;
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean;
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean;
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode;
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean;
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  const trackStyle: CSSProperties = {
    animation: `${vertical ? "qentrah-marquee-vertical" : "qentrah-marquee"} var(--duration, 40s) linear infinite`,
    animationDirection: reverse ? "reverse" : "normal",
  };

  return (
    <div
      {...props}
      className={cn(
        "qentrah-marquee group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
      data-pause-on-hover={pauseOnHover ? "true" : undefined}
    >
      <style>{`
        @keyframes qentrah-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap, 1rem))); }
        }
        @keyframes qentrah-marquee-vertical {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-100% - var(--gap, 1rem))); }
        }
        .qentrah-marquee[data-pause-on-hover="true"]:hover .qentrah-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .qentrah-marquee-track {
            animation: none !important;
          }
        }
      `}</style>
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "qentrah-marquee-track flex-row": !vertical,
              "qentrah-marquee-track flex-col": vertical,
            })}
            key={i}
            style={trackStyle}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
