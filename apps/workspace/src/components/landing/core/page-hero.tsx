import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
    badge?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    visual?: ReactNode;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    badgeWrapClassName?: string;
    titleTag?: "h1" | "div";
}

export function PageHero({
    badge,
    title,
    description,
    actions,
    visual,
    className,
    contentClassName,
    titleClassName,
    descriptionClassName,
    badgeWrapClassName,
    titleTag = "h1",
}: PageHeroProps) {
    const TitleTag = titleTag;

    return (
        <div className={cn(className)}>
            <div className={cn(contentClassName)}>
                {badge && <div className={cn(badgeWrapClassName)}>{badge}</div>}
                <TitleTag className={cn(titleClassName)}>{title}</TitleTag>
                {description && <div className={cn(descriptionClassName)}>{description}</div>}
                {actions}
            </div>
            {visual}
        </div>
    );
}
