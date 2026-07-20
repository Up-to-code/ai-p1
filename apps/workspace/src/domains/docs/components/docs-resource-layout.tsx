"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  Grid3X3,
  Home,
  LayoutList,
  List,
  Plus,
  Search,
  Clock3,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  ResourceWorkspaceLayout,
  type ResourceViewCatalogItem,
  type ResourceWorkspaceConfig,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DocFolder } from "../docs.types";

type DocsView = "list" | "grid" | "recent" | "shared";

const DOCS_VIEWS = [
  {
    id: "list",
    label: "List",
    href: "/docs",
    icon: <List className="h-3.5 w-3.5" />,
  },
  {
    id: "grid",
    label: "Grid",
    href: "/docs?view=grid",
    icon: <Grid3X3 className="h-3.5 w-3.5" />,
  },
  {
    id: "recent",
    label: "Recent",
    href: "/docs?filter=recent",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  {
    id: "shared",
    label: "Shared",
    href: "/docs?filter=shared",
    icon: <LayoutList className="h-3.5 w-3.5" />,
  },
] as const;

const DOCS_VIEW_CATALOG: ResourceViewCatalogItem[] = [
  {
    id: "list",
    label: "List",
    description: "File browser with folders and details",
    icon: <List className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "grid",
    label: "Grid",
    description: "Card-based document grid",
    icon: <Grid3X3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "recent",
    label: "Recent",
    description: "Recently edited documents",
    icon: <Clock3 className="h-4 w-4" />,
    section: "popular",
  },
  {
    id: "shared",
    label: "Shared with me",
    description: "Documents shared by teammates",
    icon: <LayoutList className="h-4 w-4" />,
    section: "more",
  },
  {
    id: "templates",
    label: "Templates",
    description: "Start from a pre-built template",
    icon: <Folder className="h-4 w-4" />,
    section: "more",
    disabled: true,
  },
];

function activeDocsView(pathname: string, searchParams: URLSearchParams): DocsView {
  const filter = searchParams.get("filter");
  const view = searchParams.get("view");
  if (filter === "shared") return "shared";
  if (filter === "recent") return "recent";
  if (view === "grid") return "grid";
  return "list";
}

export function DocsResourceLayout({
  children,
  onNewFolder,
  onNewDoc,
  breadcrumbPath,
  selectedFolderId,
  onSelectFolder,
  search,
  onSearchChange,
}: {
  children: React.ReactNode;
  onNewFolder: () => void;
  onNewDoc: () => void;
  breadcrumbPath: Array<{ id: string; name: string }>;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const t = useTranslations("Docs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeViewId = activeDocsView(pathname, searchParams);

  const views = DOCS_VIEWS.map((view) => {
    const [base, query] = view.href.split("?");
    const params = new URLSearchParams(query);
    if (selectedFolderId) params.set("folder", selectedFolderId);
    const queryString = params.toString();
    return {
      ...view,
      href: queryString ? `${base}?${queryString}` : base,
    };
  });

  const config: ResourceWorkspaceConfig = {
    resourceId: "docs",
    title: "Documents",
    activeViewId,
    views,
    actions: [
      {
        id: "new-folder",
        label: "New folder",
        icon: <Folder className="h-3.5 w-3.5" />,
        onClick: onNewFolder,
        variant: "secondary",
      },
      {
        id: "new-doc",
        label: "New doc",
        icon: <Plus className="h-3.5 w-3.5" />,
        onClick: onNewDoc,
        variant: "primary",
      },
    ],
    viewCatalog: DOCS_VIEW_CATALOG,
    onAddView: (item) => {
      if (["list", "grid", "recent", "shared"].includes(item.id)) {
        const params = new URLSearchParams();
        if (item.id === "grid") params.set("view", "grid");
        if (item.id === "recent") params.set("filter", "recent");
        if (item.id === "shared") params.set("filter", "shared");
        if (selectedFolderId) params.set("folder", selectedFolderId);
        const queryString = params.toString();
        router.push(queryString ? `/docs?${queryString}` : "/docs");
      }
    },
  };

  return (
    <ResourceWorkspaceLayout
      config={config}
      toolbar={
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-[var(--q-bg)] px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSelectFolder(null)}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-medium",
              selectedFolderId === null
                ? "bg-[var(--q-bg-secondary)] text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Home className="h-3.5 w-3.5 mr-2" />
            {t("title")}
          </Button>
          {breadcrumbPath.map((folder) => (
            <div key={folder.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "h-8 rounded-lg px-3 text-xs font-medium",
                  folder.id === selectedFolderId
                    ? "bg-[var(--q-bg-secondary)] text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {folder.name}
              </Button>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-8 items-center gap-2 rounded-md border border-border bg-[var(--q-bg-secondary)] px-3 focus-within:ring-2 focus-within:ring-ring/20">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search documents..."
                className="h-7 w-48 border-0 bg-transparent px-0 text-xs font-medium shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ResourceWorkspaceLayout>
  );
}
