import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

interface SectionLabelProps {
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

/**
 * WHY:   Public sections need small, reusable badges/labels that stay SSR-only.
 * WHAT:  Renders an optional icon plus label text with lightweight class overrides.
 * HOW:   Render-only; uses `cn` for class composition.
 */
export default function SectionLabel({
    icon: Icon,
    children,
    className,
    iconClassName,
    textClassName,
}: SectionLabelProps) {
    return (
        <div className={className}>
            {Icon && <Icon className={iconClassName} />}
            <span className={cn(textClassName)}>{children}</span>
        </div>
    );
}
