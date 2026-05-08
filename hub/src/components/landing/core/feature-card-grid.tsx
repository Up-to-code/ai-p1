import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

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

export function FeatureCardGrid({
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
