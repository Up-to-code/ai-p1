import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

interface MetricItem {
    value: ReactNode;
    label: ReactNode;
}

interface MetricGridProps {
    items: MetricItem[];
    className?: string;
    itemClassName?: string;
    valueClassName?: string;
    labelClassName?: string;
}

/**
 * WHY:   Public narrative pages need a compact way to show KPI-style metrics without JS.
 * WHAT:  Renders a grid of value/label pairs with optional per-slot class overrides.
 * HOW:   Render-only mapping; stays server-renderable.
 */
export default function MetricGrid({
    items,
    className,
    itemClassName,
    valueClassName,
    labelClassName,
}: MetricGridProps) {
    return (
        <div className={cn(className)}>
            {items.map((item, index) => (
                <div key={index} className={cn(itemClassName)}>
                    <span className={cn(valueClassName)}>{item.value}</span>
                    <span className={cn(labelClassName)}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}
