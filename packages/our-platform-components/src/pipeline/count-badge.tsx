import { badgeBgFor } from "./stage-color";

export interface CountBadgeProps {
  color: string;
  count: number;
}

export function CountBadge({ color, count }: CountBadgeProps) {
  return (
    <span
      className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-none"
      style={{ backgroundColor: badgeBgFor(color, false), color }}
    >
      {count}
    </span>
  );
}
