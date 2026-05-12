import { memo } from "react";
import { cn } from "@anan/platform-core/classnames";

type PropertyCardSpec = {
  label: string;
  value: string;
};

export type WorkspacePropertyCardContentProps = {
  image: string;
  title: string;
  location: string;
  priceLabel: string;
  summary: string;
  specs: PropertyCardSpec[];
  footer?: React.ReactNode;
  publicationBadge?: React.ReactNode;
  density?: "compact" | "detail" | "flexible";
};

/**
 * WHY:   Multiple workspace zones need one reusable real-estate card instead of bespoke text blocks.
 * WHAT:  Renders a clean, minimal property card with image, key info, specs, and optional footer.
 * HOW:   Uses a simple photo hero with a tighter layout that keeps attention on the item itself.
 */
export function WorkspacePropertyCardContent({
  image,
  title,
  location,
  priceLabel,
  summary,
  specs,
  footer,
  publicationBadge,
  density = "compact",
}: WorkspacePropertyCardContentProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-foreground/20",
        density === "flexible" ? "w-full" : density === "detail" ? "w-full max-w-sm" : "w-full max-w-xs",
      )}
    >
      <div className="h-44 overflow-hidden bg-muted/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-right">
            <h2 className="truncate text-base font-semibold leading-tight text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          </div>
          <div className="shrink-0 text-sm font-semibold text-foreground">{priceLabel}</div>
        </div>

        {summary ? <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p> : null}

        {specs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4">
            {specs.slice(0, 4).map((spec) => (
              <div key={spec.label}>
                <div className="text-[11px] text-muted-foreground">{spec.label}</div>
                <div className="mt-1 text-sm font-medium text-foreground">{spec.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {publicationBadge ? <div className="text-xs text-muted-foreground">{publicationBadge}</div> : null}

        {footer ? <div className="border-t border-border/60 pt-3">{footer}</div> : null}
      </div>
    </article>
  );
}

export default memo(WorkspacePropertyCardContent);
