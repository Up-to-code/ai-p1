import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionLabelProps {
    icon?: LucideIcon;
    children: ReactNode;
    className?: string;
    iconClassName?: string;
    textClassName?: string;
}

export function SectionLabel({
    icon: Icon,
    children,
    className,
    iconClassName,
    textClassName,
}: SectionLabelProps) {
    return (
        <div className={cn(className)}>
            {Icon && <Icon className={cn(iconClassName)} />}
            <span className={cn(textClassName)}>{children}</span>
        </div>
    );
}
