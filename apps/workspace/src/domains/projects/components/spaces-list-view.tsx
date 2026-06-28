"use client";

import { useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Layers, FolderGit2, Users, Plus } from "lucide-react";
import { useAccountContext } from "@/domains/auth";
import { useNavigation } from "@/domains/navigation";
import { useWorkspaceSpacesQuery } from "@/domains/projects/api/spaces";
import { useProjectsIndexQuery } from "@/domains/projects/api/projects";

function SpaceCard({
  name,
  color,
  icon,
  projectCount,
  teamCount,
  onClick,
}: {
  name: string;
  color?: string;
  icon?: string;
  projectCount: number;
  teamCount: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-start transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold"
          style={{ backgroundColor: color ? `${color}20` : "rgb(243 244 246)" }}
        >
          {icon || <Layers className="h-5 w-5" style={{ color }} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-foreground">{name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FolderGit2 className="h-3.5 w-3.5" />
          {projectCount} project{projectCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {teamCount} team{teamCount !== 1 ? "s" : ""}
        </span>
      </div>
    </button>
  );
}

export function SpacesListView() {
  const account = useAccountContext();
  const { setSpace } = useNavigation();
  const t = useTranslations("Spaces");

  const orgId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const spaces = useWorkspaceSpacesQuery(orgId);
  const projectsQuery = useProjectsIndexQuery(orgId);
  const projects = projectsQuery.results ?? [];

  const spaceList = spaces ?? [];
  const isLoading = spaces === undefined;

  const projectsBySpace = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      const spaceId = (project as { spaceId?: string }).spaceId;
      if (spaceId) {
        map.set(spaceId, (map.get(spaceId) ?? 0) + 1);
      }
    }
    return map;
  }, [projects]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLoading ? "..." : `${spaceList.length} space${spaceList.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm">
          <Plus className="h-4 w-4" />
          {t("createSpace")}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : spaceList.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">{t("noSpaces")}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaceList.map((space) => (
            <SpaceCard
              key={space.id}
              name={space.name}
              color={space.color}
              icon={space.icon}
              projectCount={projectsBySpace.get(space.id) ?? 0}
              teamCount={0}
              onClick={() => setSpace(space.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
