"use client";

import {
  BarChart3,
  CalendarDays,
  Columns3,
  GanttChart,
  LayoutDashboard,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  ResourceWorkspaceLayout,
  type ResourceViewCatalogItem,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { Input } from "@/components/ui/input";

type DealView = "table" | "pipeline" | "board" | "calendar" | "timeline" | "dashboard";

const DEAL_VIEWS = [
  {
    id: "pipeline",
    label: "Pipeline",
    href: "/deals/pipeline",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
  },
  {
    id: "board",
    label: "Board",
    href: "/deals/board",
    icon: <Columns3 className="h-3.5 w-3.5" />,
  },
  {
    id: "table",
    label: "Table",
    href: "/deals/table",
    icon: <Table2 className="h-3.5 w-3.5" />,
  },
] as const;

const DEAL_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  {
    id: "pipeline",
    label: "Pipeline",
    description: "Drag deals through stages",
    icon: <BarChart3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "board",
    label: "Board",
    description: "Kanban-style deal cards",
    icon: <Columns3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "table",
    label: "Table",
    description: "Structured deal fields",
    icon: <Table2 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "View deals by close date",
    icon: <CalendarDays className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Track deal progress over time",
    icon: <GanttChart className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Deal metrics and insights",
    icon: <LayoutDashboard className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
];

function activeDealView(pathname: string): DealView {
  if (pathname.includes("/deals/table")) return "table";
  if (pathname.includes("/deals/board")) return "board";
  if (pathname.includes("/deals/pipeline")) return "pipeline";
  return "pipeline";
}

export function DealsResourceLayout({
  children,
  dealCount,
  search,
  onSearchChange,
  onAddDeal,
}: {
  children: React.ReactNode;
  dealCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onAddDeal: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeViewId = activeDealView(pathname);

  const views = DEAL_VIEWS.map((view) => {
    const query = searchParams.toString();
    return {
      ...view,
      href: query ? `${view.href}?${query}` : view.href,
    };
  });

  const config: ResourceWorkspaceConfig = {
    resourceId: "deals",
    title: "Deals",
    count: `${dealCount} deal${dealCount === 1 ? "" : "s"}`,
    activeViewId,
    views,
    actions: [
      {
        id: "new-deal",
        label: "New deal",
        icon: <Plus className="h-3.5 w-3.5" />,
        onClick: onAddDeal,
        variant: "primary",
      },
    ],
    viewCatalog: DEAL_VIEW_CATALOG,
    onAddView: (item) => {
      if (["pipeline", "board", "table"].includes(item.id)) {
        const query = searchParams.toString();
        const href = query ? `/deals/${item.id}?${query}` : `/deals/${item.id}`;
        router.push(href);
      }
    },
  };

  return (
    <ResourceWorkspaceLayout
      config={config}
      toolbar={
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="text-sm font-medium text-muted-foreground">
            {dealCount} deal{dealCount === 1 ? "" : "s"}
          </div>
          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search deals"
              className="h-8 rounded-md border-border bg-background pl-9 shadow-none"
            />
          </div>
        </div>
      }
    >
      {children}
    </ResourceWorkspaceLayout>
  );
}
