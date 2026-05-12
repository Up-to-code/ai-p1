import type { LucideIcon } from "lucide-react";
import { cn } from "@anan/platform-core/classnames";
import Card from "./Card";

interface FeatureCardItem {
    title: string;
    description: string;
    icon?: LucideIcon;
    variant?: "default" | "dark" | "accent";
    className?: string;
}

interface FeatureCardGridProps {
    items: FeatureCardItem[];
    className?: string;
}

/**
 * WHY:   Marketing pages need lightweight, repeatable feature grids without forcing client hydration.
 * WHAT:  Maps an array of feature items into styled `Card` components.
 * HOW:   Pure render-only component (no state/effects), safe to keep as a Server Component.
 */
export default function FeatureCardGrid({
    items,
    className,
}: FeatureCardGridProps) {
    return (
        <div className={cn(className)}>
            {items.map((item) => (
                <Card
                    key={`${item.title}-${item.description}`}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                    variant={item.variant}
                    className={item.className}
                />
            ))}
        </div>
    );
}
