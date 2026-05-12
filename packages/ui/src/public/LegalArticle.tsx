import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

interface LegalArticleProps {
    title: ReactNode;
    children: ReactNode;
    className?: string;
    titleClassName?: string;
}

/**
 * WHY:   Legal pages need structured article blocks with consistent typography and no client JS.
 * WHAT:  Renders an article title plus children content with optional class overrides.
 * HOW:   Pure composition using semantic tags.
 */
export default function LegalArticle({
    title,
    children,
    className,
    titleClassName,
}: LegalArticleProps) {
    return (
        <article className={cn(className)}>
            <h2 className={cn(titleClassName)}>{title}</h2>
            {children}
        </article>
    );
}
