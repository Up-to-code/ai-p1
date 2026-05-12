import type { ComponentType, ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

export type RouteTab = {
  href: string;
  label: ReactNode;
  exact?: boolean;
};

export type RouteTabsLinkProps = {
  href: string;
  className?: string;
  "aria-current"?: "page";
  children: ReactNode;
};

export type RouteTabsProps = {
  tabs: RouteTab[];
  activePath: string;
  className?: string;
  mode?: "segmented" | "subnav";
  LinkComponent?: ComponentType<RouteTabsLinkProps>;
};

function AnchorLink({ href, ...props }: RouteTabsLinkProps) {
  return <a href={href} {...props} />;
}

export default function RouteTabs({
  tabs,
  activePath,
  className,
  mode = "segmented",
  LinkComponent = AnchorLink,
}: RouteTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        mode === "segmented"
          ? "flex flex-wrap items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)] pb-3"
          : "flex flex-wrap items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)] pb-2",
        className,
      )}
      aria-label="section tabs"
    >
      {tabs.map((tab) => {
        const active = tab.exact ? activePath === tab.href : activePath === tab.href || activePath.startsWith(`${tab.href}/`);

        return (
          <LinkComponent
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              mode === "segmented"
                ? "rounded-sm border px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.16em] transition-all"
                : "rounded-sm border border-transparent px-3 py-2 text-[12px] font-black tracking-[0.08em] transition-all",
              active
                ? mode === "segmented"
                  ? "border-[color:var(--workspace-highlight-border)] bg-[var(--workspace-highlight)] text-white"
                  : "border-[color:var(--workspace-highlight-border)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-bubble-other-foreground)]"
                : mode === "segmented"
                  ? "border-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]"
                  : "text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]",
            )}
          >
            {tab.label}
          </LinkComponent>
        );
      })}
    </nav>
  );
}
