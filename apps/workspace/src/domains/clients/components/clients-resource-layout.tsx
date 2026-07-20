"use client";

import {
  Columns3,
  Kanban,
  List,
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

type ClientView = "table" | "pipeline" | "board";

const CLIENT_VIEWS = [
  {
    id: "table",
    label: "Table",
    href: "/clients/table",
    icon: <Table2 className="h-3.5 w-3.5" />,
  },
  {
    id: "pipeline",
    label: "Pipeline",
    href: "/clients/pipeline",
    icon: <Kanban className="h-3.5 w-3.5" />,
  },
  {
    id: "board",
    label: "Board",
    href: "/clients/board",
    icon: <Columns3 className="h-3.5 w-3.5" />,
  },
] as const;

const CLIENT_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  {
    id: "table",
    label: "Table",
    description: "Structured client fields with inline editing",
    icon: <Table2 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    description: "Drag clients through pipeline stages",
    icon: <Kanban className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "board",
    label: "Board",
    description: "Grouped client cards by stage",
    icon: <Columns3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "list",
    label: "List",
    description: "Simple client list view",
    icon: <List className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "View clients by creation date",
    icon: <List className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
];

function activeClientView(pathname: string): ClientView {
  if (pathname.includes("/clients/pipeline")) return "pipeline";
  if (pathname.includes("/clients/board")) return "board";
  return "table";
}

export function ClientsResourceLayout({
  children,
  clientCount,
  search,
  onSearchChange,
  onAddClient,
}: {
  children: React.ReactNode;
  clientCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  onAddClient: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeViewId = activeClientView(pathname);

  const views = CLIENT_VIEWS.map((view) => {
    const query = searchParams.toString();
    return {
      ...view,
      href: query ? `${view.href}?${query}` : view.href,
    };
  });

  const config: ResourceWorkspaceConfig = {
    resourceId: "clients",
    title: "Clients",
    count: `${clientCount} client${clientCount === 1 ? "" : "s"}`,
    activeViewId,
    views,
    actions: [
      {
        id: "add-client",
        label: "Add client",
        icon: <Plus className="h-3.5 w-3.5" />,
        onClick: onAddClient,
        variant: "primary",
      },
    ],
    viewCatalog: CLIENT_VIEW_CATALOG,
    onAddView: (item) => {
      if (["table", "pipeline", "board"].includes(item.id)) {
        const query = searchParams.toString();
        const href = query ? `/clients/${item.id}?${query}` : `/clients/${item.id}`;
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
            {clientCount} client{clientCount === 1 ? "" : "s"}
          </div>
          <div className="relative ml-auto w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients"
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
